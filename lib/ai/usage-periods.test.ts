import { describe, expect, it, vi, afterEach } from "vitest";
import { startOfMonthUtc, startOfTodayUtc } from "./usage-periods";

describe("usage UTC periods", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("startOfTodayUtc is midnight UTC on the current UTC date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T15:30:00.000Z"));

    expect(startOfTodayUtc().toISOString()).toBe("2026-05-29T00:00:00.000Z");
  });

  it("startOfMonthUtc is the first day of the month at midnight UTC", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T15:30:00.000Z"));

    expect(startOfMonthUtc().toISOString()).toBe("2026-05-01T00:00:00.000Z");
  });
});
