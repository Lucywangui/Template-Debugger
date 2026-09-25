import { ApiError, apiRequest as request } from "@/lib/api";
import {
  syncStudentToBackend,
  useSomaStore,
} from "@/lib/storage";


/* =========================================================
   M-PESA WALLET TOP-UP
   Talks to the Flask backend, which owns the KSh wallet.
   ========================================================= */

export const MIN_TOPUP_AMOUNT = 1;
export const MAX_TOPUP_AMOUNT = 150000;

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "expired";

export type PollOutcome =
  | { status: "completed"; walletBalance: number }
  | { status: "failed" | "expired" }
  | { status: "timeout" }
  | { status: "aborted" };

function currentStudent() {
  const state = useSomaStore.getState();

  return {
    soma_hub_code: state.somaHubCode,
    name: state.name ?? "",
    school_name: state.schoolName ?? "",
    grade: state.grade ?? "",
  };
}

/** Returns true for a whole number of shillings M-Pesa will accept. */
export function isValidTopUpAmount(amount: number): boolean {
  return (
    Number.isInteger(amount) &&
    amount >= MIN_TOPUP_AMOUNT &&
    amount <= MAX_TOPUP_AMOUNT
  );
}

/**
 * Sends an STK Push to the phone. If the backend doesn't know
 * this student yet (signup sync failed), registers them and
 * retries once.
 */
export async function startTopUp(
  phoneNumber: string,
  amount: number
): Promise<{ sessionId: string }> {
  const send = () =>
    request<{ session_id: string }>(
      "/api/mpesa/payment-session",
      {
        method: "POST",
        body: JSON.stringify({
          soma_hub_code: currentStudent().soma_hub_code,
          phone_number: phoneNumber,
          amount,
        }),
      }
    );

  try {
    const result = await send();
    return { sessionId: result.session_id };
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      error.httpStatus !== 404
    ) {
      throw error;
    }

    await syncStudentToBackend(currentStudent());

    const result = await send();
    return { sessionId: result.session_id };
  }
}

export async function getPaymentStatus(
  sessionId: string
): Promise<{ status: PaymentStatus; walletBalance: number }> {
  const result = await request<{
    status: PaymentStatus;
    wallet_balance: number;
  }>(
    `/api/mpesa/payment-status/${encodeURIComponent(sessionId)}`
  );

  return {
    status: result.status,
    walletBalance: result.wallet_balance,
  };
}

/** Sandbox only: completes a pending session without a phone. */
export async function simulateTestPayment(
  sessionId: string
): Promise<void> {
  await request(
    `/api/dev/test-payment/${encodeURIComponent(sessionId)}`,
    { method: "POST" }
  );
}

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls until the payment settles, the timeout passes, or the
 * signal aborts. Network errors while polling are retried,
 * since the customer may still be entering their PIN.
 */
export async function pollPaymentStatus(
  sessionId: string,
  options: {
    intervalMs?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
    fetchStatus?: typeof getPaymentStatus;
    wait?: (ms: number) => Promise<unknown>;
    now?: () => number;
  } = {}
): Promise<PollOutcome> {
  const {
    intervalMs = 3000,
    timeoutMs = 120000,
    signal,
    fetchStatus = getPaymentStatus,
    wait = sleep,
    now = Date.now,
  } = options;

  const deadline = now() + timeoutMs;

  while (now() < deadline) {
    await wait(intervalMs);

    if (signal?.aborted) {
      return { status: "aborted" };
    }

    try {
      const result = await fetchStatus(sessionId);

      if (result.status === "completed") {
        return {
          status: "completed",
          walletBalance: result.walletBalance,
        };
      }

      if (
        result.status === "failed" ||
        result.status === "expired"
      ) {
        return { status: result.status };
      }
    } catch {
      // Keep polling; a later check may succeed.
    }
  }

  return { status: "timeout" };
}
