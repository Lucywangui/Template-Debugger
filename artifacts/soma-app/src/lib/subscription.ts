import type { Subscription } from "@/lib/storage";

const DAY_MS = 86400000;

/** Days before the end date that the renewal banner appears. */
export const RENEW_WARNING_DAYS = 3;
/** Days after the end date that the banner keeps showing. */
export const RENEW_GRACE_DAYS = 7;

/** The server sends local time as "YYYY-MM-DD HH:MM:SS". */
export function parseServerTime(value: string): Date {
  return new Date(value.replace(" ", "T"));
}

export function formatExpiry(expiresAt: string): string {
  return parseServerTime(expiresAt).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Whole days until the end date; negative once it has passed. */
export function daysUntil(expiresAt: string, now = new Date()): number {
  return Math.ceil(
    (parseServerTime(expiresAt).getTime() - now.getTime()) / DAY_MS
  );
}

export type RenewBanner =
  | { kind: "ending"; daysLeft: number }
  | { kind: "ended" }
  | null;

export function renewBanner(
  subscription: Subscription | null,
  now = new Date()
): RenewBanner {
  if (!subscription) return null;

  const days = daysUntil(subscription.expiresAt, now);

  if (subscription.active && days <= RENEW_WARNING_DAYS) {
    return { kind: "ending", daysLeft: Math.max(days, 0) };
  }

  if (!subscription.active && days >= -RENEW_GRACE_DAYS) {
    return { kind: "ended" };
  }

  return null;
}
