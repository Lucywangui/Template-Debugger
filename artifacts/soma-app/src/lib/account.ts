import {
  ApiError,
  apiRequest,
  newRequestId,
  postJson,
} from "@/lib/api";
import {
  syncStudentToBackend,
  useSomaStore,
  type ServerAccount,
} from "@/lib/storage";

/* =========================================================
   SERVER ACCOUNT: COINS, KSH AND UNLOCKS
   The server owns both balances. Every successful response
   carries the updated account, which replaces the store's copy.
   ========================================================= */

interface AccountResponse {
  coins: number;
  ksh: number;
  unlocked: string[];
  earned_today: number;
  imported: boolean;
  prices: {
    material_coins: number;
    ksh_per_coin: number;
    daily_cap: number;
  };
}

export function toServerAccount(
  response: AccountResponse
): ServerAccount {
  return {
    coins: response.coins,
    ksh: response.ksh,
    unlocked: response.unlocked,
    earnedToday: response.earned_today,
    imported: response.imported,
    prices: {
      materialCoins: response.prices.material_coins,
      kshPerCoin: response.prices.ksh_per_coin,
      dailyCap: response.prices.daily_cap,
    },
  };
}

function apply(response: AccountResponse) {
  useSomaStore
    .getState()
    .applyAccount(toServerAccount(response));
}

function student() {
  const state = useSomaStore.getState();

  return {
    soma_hub_code: state.somaHubCode,
    name: state.name ?? "",
    school_name: state.schoolName ?? "",
    grade: state.grade ?? "",
  };
}

/** Retries once after registering the student if the server doesn't know them. */
async function withRegistration<T>(
  call: () => Promise<T>
): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.httpStatus === 404 &&
      student().name
    ) {
      await syncStudentToBackend(student());
      return call();
    }

    throw error;
  }
}

/* ---------------------------------------------------------
   Sync
   --------------------------------------------------------- */

let syncInFlight: Promise<void> | null = null;

/**
 * Loads the server account into the store. The first time a
 * device syncs, its local coins and unlocks are moved to the
 * server (the server caps the coins and only does this once).
 * Also sends any quiz rewards earned while offline.
 */
export function syncAccount(): Promise<void> {
  if (!syncInFlight) {
    syncInFlight = runSync().finally(() => {
      syncInFlight = null;
    });
  }

  return syncInFlight;
}

async function runSync() {
  const code = student().soma_hub_code;

  let account = await withRegistration(() =>
    apiRequest<AccountResponse>(
      `/api/account/${encodeURIComponent(code)}`
    )
  );

  if (!account.imported) {
    const state = useSomaStore.getState();

    account = await postJson<AccountResponse>(
      "/api/account/import",
      {
        soma_hub_code: code,
        coins: state.wallet,
        unlocked: [
          ...state.purchased,
          ...state.libraryHidden,
        ],
      }
    );
  }

  apply(account);

  await flushRewards();
}

/* ---------------------------------------------------------
   Unlocking
   --------------------------------------------------------- */

export type UnlockResult =
  | {
      status: "unlocked";
      coinsSpent: number;
      kshSpent: number;
      alreadyUnlocked: boolean;
    }
  | {
      status: "short";
      coins: number;
      ksh: number;
      price: number;
      shortfallCoins: number;
      kshNeeded: number;
      canPayWithKsh: boolean;
    }
  | { status: "error"; message: string };

/**
 * Unlocks a material. Without allowKsh, a coin shortfall comes
 * back as "short" so the app can ask before spending KSh.
 */
export async function unlockMaterial(
  materialId: string,
  allowKsh = false
): Promise<UnlockResult> {
  try {
    const response = await withRegistration(() =>
      postJson<
        AccountResponse & {
          coins_spent: number;
          ksh_spent: number;
          already_unlocked: boolean;
        }
      >("/api/unlocks", {
        soma_hub_code: student().soma_hub_code,
        material_id: materialId,
        allow_ksh: allowKsh,
      })
    );

    apply(response);
    useSomaStore.getState().showInLibrary(materialId);

    return {
      status: "unlocked",
      coinsSpent: response.coins_spent,
      kshSpent: response.ksh_spent,
      alreadyUnlocked: response.already_unlocked,
    };
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.httpStatus === 402
    ) {
      const body = error.body as Record<string, number | boolean>;

      return {
        status: "short",
        coins: Number(body.coins),
        ksh: Number(body.ksh),
        price: Number(body.price),
        shortfallCoins: Number(body.shortfall_coins),
        kshNeeded: Number(body.ksh_needed),
        canPayWithKsh: body.can_pay_with_ksh === true,
      };
    }

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Couldn't unlock this material.",
    };
  }
}

/* ---------------------------------------------------------
   Buying coins
   --------------------------------------------------------- */

export async function buyCoins(
  coins: number,
  requestId = newRequestId()
): Promise<void> {
  const response = await withRegistration(() =>
    postJson<AccountResponse>("/api/coins/buy", {
      soma_hub_code: student().soma_hub_code,
      coins,
      request_id: requestId,
    })
  );

  apply(response);
}

/** Sandbox only: adds 100 coins for testing. */
export async function grantDevCoins(): Promise<void> {
  apply(
    await postJson<AccountResponse>(
      "/api/dev/grant-coins",
      { soma_hub_code: student().soma_hub_code }
    )
  );
}

/* ---------------------------------------------------------
   Quiz rewards (offline-safe)
   --------------------------------------------------------- */

export interface RewardClaim {
  attemptId: string;
  materialId: string;
  type: "topical" | "exam";
  percentage: number;
}

const OUTBOX_KEY = "soma_reward_outbox";

export function loadOutbox(): RewardClaim[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOutbox(claims: RewardClaim[]) {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(claims));
  } catch {
    // Storage unavailable (private mode): offline claims are lost.
  }
}

/**
 * Records a finished quiz and sends it to the server. The claim
 * waits in a local outbox until the server accepts it, so quizzes
 * done offline are paid later. The attempt ID makes resending safe.
 */
export function claimReward(
  claim: Omit<RewardClaim, "attemptId">
): Promise<void> {
  saveOutbox([
    ...loadOutbox(),
    { ...claim, attemptId: newRequestId() },
  ]);

  return flushRewards();
}

let flushInFlight: Promise<void> | null = null;

export function flushRewards(): Promise<void> {
  if (!flushInFlight) {
    flushInFlight = runFlush().finally(() => {
      flushInFlight = null;
    });
  }

  return flushInFlight;
}

async function runFlush() {
  // Re-read the outbox each time so claims added while this runs
  // are sent too. `done` guards against a loop if saving fails.
  const done = new Set<string>();

  for (;;) {
    const claim = loadOutbox().find(
      (queued) => !done.has(queued.attemptId)
    );

    if (!claim) return;

    try {
      const response = await withRegistration(() =>
        postJson<AccountResponse>("/api/coins/reward", {
          soma_hub_code: student().soma_hub_code,
          attempt_id: claim.attemptId,
          material_id: claim.materialId,
          type: claim.type,
          percentage: claim.percentage,
        })
      );

      apply(response);
    } catch (error) {
      const retryLater =
        !(error instanceof ApiError) ||
        error.isNetworkError ||
        error.httpStatus === 404 ||
        (error.httpStatus ?? 0) >= 500;

      // Offline or server trouble: keep this and later claims.
      if (retryLater) return;

      // The server rejected the claim itself; drop it.
    }

    done.add(claim.attemptId);

    saveOutbox(
      loadOutbox().filter(
        (queued) => queued.attemptId !== claim.attemptId
      )
    );
  }
}
