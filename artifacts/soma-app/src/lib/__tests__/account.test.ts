import { beforeEach, describe, expect, it, vi } from "vitest";

const applyAccount = vi.fn();
const showInLibrary = vi.fn();
const syncStudentToBackend = vi.fn();
const state = {
  somaHubCode: "SH-ABC123",
  name: "Wanjiku",
  schoolName: "Test School",
  grade: "Grade 7",
  wallet: 80,
  purchased: ["m1"],
  libraryHidden: ["m2"],
  applyAccount,
  showInLibrary,
};

vi.mock("@/lib/storage", () => ({
  SOMA_API_BASE_URL: "http://api.test",
  syncStudentToBackend: (...args: unknown[]) => syncStudentToBackend(...args),
  useSomaStore: { getState: () => state },
}));

import {
  claimReward,
  flushRewards,
  loadOutbox,
  syncAccount,
  unlockMaterial,
} from "@/lib/account";

const ACCOUNT = {
  success: true,
  coins: 10,
  ksh: 50,
  unlocked: ["m1"],
  earned_today: 0,
  imported: true,
  prices: { material_coins: 5, ksh_per_coin: 1, daily_cap: 200 },
};

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status });
}

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

function sentBodies(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.map(([url, init]) => ({
    url: String(url).replace("http://api.test", ""),
    body: init?.body ? JSON.parse(init.body as string) : undefined,
  }));
}

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.stubGlobal("localStorage", memoryStorage());
  applyAccount.mockReset();
  syncStudentToBackend.mockReset();
});

describe("claimReward", () => {
  it("sends the claim and clears it from the outbox", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, ACCOUNT));
    vi.stubGlobal("fetch", fetchMock);

    await claimReward({ materialId: "m1", type: "exam", percentage: 90 });

    const [call] = sentBodies(fetchMock);
    expect(call.url).toBe("/api/coins/reward");
    expect(call.body).toMatchObject({
      soma_hub_code: "SH-ABC123",
      material_id: "m1",
      type: "exam",
      percentage: 90,
    });
    expect(call.body.attempt_id).toEqual(expect.any(String));
    expect(loadOutbox()).toEqual([]);
    expect(applyAccount).toHaveBeenCalledWith(expect.objectContaining({ coins: 10, ksh: 50 }));
  });

  it("keeps claims while offline and resends them in order with the same IDs", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("offline"); }));

    await claimReward({ materialId: "a", type: "topical", percentage: 50 });
    await claimReward({ materialId: "b", type: "topical", percentage: 60 });

    const queued = loadOutbox();
    expect(queued.map((c) => c.materialId)).toEqual(["a", "b"]);

    const fetchMock = vi.fn(async () => jsonResponse(200, ACCOUNT));
    vi.stubGlobal("fetch", fetchMock);
    await flushRewards();

    expect(sentBodies(fetchMock).map((c) => c.body.attempt_id)).toEqual(
      queued.map((c) => c.attemptId),
    );
    expect(loadOutbox()).toEqual([]);
  });

  it("keeps the claim when the server errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(500, { success: false })));

    await claimReward({ materialId: "a", type: "topical", percentage: 50 });

    expect(loadOutbox()).toHaveLength(1);
  });

  it("drops a claim the server rejects and carries on", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(400, { success: false, message: "bad" }))
      .mockResolvedValueOnce(jsonResponse(200, ACCOUNT));
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("offline"); }));
    await claimReward({ materialId: "bad", type: "topical", percentage: 50 });
    await claimReward({ materialId: "good", type: "topical", percentage: 50 });

    vi.stubGlobal("fetch", fetchMock);
    await flushRewards();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(loadOutbox()).toEqual([]);
  });

  it("registers an unknown student, then sends the claim", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(404, { success: false, message: "Student not found" }))
      .mockResolvedValueOnce(jsonResponse(200, ACCOUNT));
    vi.stubGlobal("fetch", fetchMock);

    await claimReward({ materialId: "a", type: "topical", percentage: 50 });

    expect(syncStudentToBackend).toHaveBeenCalledOnce();
    expect(loadOutbox()).toEqual([]);
  });
});

describe("unlockMaterial", () => {
  it("returns unlocked and applies the account", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(200, { ...ACCOUNT, coins_spent: 5, ksh_spent: 0, already_unlocked: false })),
    );

    const result = await unlockMaterial("m9");

    expect(result).toEqual({ status: "unlocked", coinsSpent: 5, kshSpent: 0, alreadyUnlocked: false });
    expect(applyAccount).toHaveBeenCalled();
    expect(showInLibrary).toHaveBeenCalledWith("m9");
  });

  it("maps a 402 to a shortfall", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(402, {
          success: false,
          message: "Not enough coins",
          coins: 2,
          ksh: 50,
          price: 5,
          shortfall_coins: 3,
          ksh_needed: 3,
          can_pay_with_ksh: true,
        }),
      ),
    );

    expect(await unlockMaterial("m9")).toEqual({
      status: "short",
      coins: 2,
      ksh: 50,
      price: 5,
      shortfallCoins: 3,
      kshNeeded: 3,
      canPayWithKsh: true,
    });
  });

  it("sends allow_ksh when confirmed", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(200, { ...ACCOUNT, coins_spent: 2, ksh_spent: 3, already_unlocked: false }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await unlockMaterial("m9", true);

    expect(sentBodies(fetchMock)[0].body.allow_ksh).toBe(true);
  });

  it("returns an error when offline", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("offline"); }));

    const result = await unlockMaterial("m9");

    expect(result.status).toBe("error");
  });
});

describe("syncAccount", () => {
  it("imports local coins and all local unlocks the first time", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { ...ACCOUNT, imported: false, coins: 0, unlocked: [] }))
      .mockResolvedValueOnce(jsonResponse(200, ACCOUNT));
    vi.stubGlobal("fetch", fetchMock);

    await syncAccount();

    const calls = sentBodies(fetchMock);
    expect(calls[1]).toEqual({
      url: "/api/account/import",
      body: { soma_hub_code: "SH-ABC123", coins: 80, unlocked: ["m1", "m2"] },
    });
    expect(applyAccount).toHaveBeenLastCalledWith(expect.objectContaining({ coins: 10 }));
  });

  it("skips the import once done", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, ACCOUNT));
    vi.stubGlobal("fetch", fetchMock);

    await syncAccount();

    expect(sentBodies(fetchMock).map((c) => c.url)).toEqual(["/api/account/SH-ABC123"]);
  });
});
