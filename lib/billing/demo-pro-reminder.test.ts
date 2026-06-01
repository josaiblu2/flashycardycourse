import { describe, expect, it } from "vitest";
import { shouldShowDemoProWaitlistReminder } from "@/lib/billing/demo-pro-reminder";

describe("shouldShowDemoProWaitlistReminder", () => {
  it("returns false before 7 days", () => {
    const activatedAt = new Date();
    expect(
      shouldShowDemoProWaitlistReminder(activatedAt, null, false)
    ).toBe(false);
  });

  it("returns true after 7 days when not dismissed and not on waitlist", () => {
    const activatedAt = new Date();
    activatedAt.setDate(activatedAt.getDate() - 8);
    expect(
      shouldShowDemoProWaitlistReminder(activatedAt, null, false)
    ).toBe(true);
  });

  it("returns false when already on waitlist", () => {
    const activatedAt = new Date();
    activatedAt.setDate(activatedAt.getDate() - 8);
    expect(
      shouldShowDemoProWaitlistReminder(activatedAt, null, true)
    ).toBe(false);
  });

  it("returns false when reminder was dismissed", () => {
    const activatedAt = new Date();
    activatedAt.setDate(activatedAt.getDate() - 8);
    expect(
      shouldShowDemoProWaitlistReminder(activatedAt, new Date(), false)
    ).toBe(false);
  });
});
