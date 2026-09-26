import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/storage", () => ({}));

import { daysUntil, renewBanner } from "@/lib/subscription";
import type { Subscription } from "@/lib/storage";

const NOW = new Date("2026-09-26T12:00:00");

const sub = (expiresAt: string, active: boolean): Subscription => ({
  gradeKey: "cbc-7",
  expiresAt,
  active,
});

describe("daysUntil", () => {
  it("counts whole days, rounding up", () => {
    expect(daysUntil("2026-09-29 12:00:00", NOW)).toBe(3);
    expect(daysUntil("2026-09-26 18:00:00", NOW)).toBe(1);
    expect(daysUntil("2026-09-20 12:00:00", NOW)).toBe(-6);
  });
});

describe("renewBanner", () => {
  it("is hidden with no subscription", () => {
    expect(renewBanner(null, NOW)).toBeNull();
  });

  it("is hidden while plenty of time is left", () => {
    expect(renewBanner(sub("2026-10-20 12:00:00", true), NOW)).toBeNull();
  });

  it("warns in the last 3 days", () => {
    expect(renewBanner(sub("2026-09-29 12:00:00", true), NOW)).toEqual({ kind: "ending", daysLeft: 3 });
  });

  it("shows ended for a week after the end", () => {
    expect(renewBanner(sub("2026-09-20 12:00:00", false), NOW)).toEqual({ kind: "ended" });
  });

  it("goes away after the grace week", () => {
    expect(renewBanner(sub("2026-09-01 12:00:00", false), NOW)).toBeNull();
  });
});
