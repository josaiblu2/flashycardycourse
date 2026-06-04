import "server-only";

import { isAdminUser } from "@/lib/admin/require-admin";
import { isBillingEnabled } from "@/lib/billing/config";
import {
  activateDemoProRecord,
  getCachedDemoProActivationByUser,
} from "@/db/queries/demo-pro";
import type { HasFeature } from "@/lib/billing/entitlements";
import { isUserOnWaitlist } from "@/lib/waitlist/status";

export type ProAccessSource = "admin" | "clerk" | "demo" | "free";

export type ProAccess = {
  hasPro: boolean;
  isClerkPro: boolean;
  isDemoPro: boolean;
  isAdmin: boolean;
  source: ProAccessSource;
};

export async function resolveProAccess(
  userId: string,
  has: HasFeature
): Promise<ProAccess> {
  const isAdmin = await isAdminUser(userId);
  if (isAdmin) {
    return {
      hasPro: true,
      isClerkPro: false,
      isDemoPro: false,
      isAdmin: true,
      source: "admin",
    };
  }

  const isClerkPro =
    isBillingEnabled() &&
    (has({ feature: "ai_flashcard_generation" }) ||
      has({ feature: "unlimited_decks" }) ||
      has({ plan: "pro" }));

  if (isClerkPro) {
    return {
      hasPro: true,
      isClerkPro: true,
      isDemoPro: false,
      isAdmin: false,
      source: "clerk",
    };
  }

  const demoActivation =
    !isBillingEnabled()
      ? await getCachedDemoProActivationByUser(userId)
      : null;
  let isDemoPro = demoActivation !== null;

  // Legacy backfill: waitlist previously unlocked Demo Pro before separate activation existed.
  if (!isDemoPro && !isBillingEnabled() && (await isUserOnWaitlist(userId))) {
    await activateDemoProRecord(userId);
    isDemoPro = true;
  }

  if (isDemoPro) {
    return {
      hasPro: true,
      isClerkPro: false,
      isDemoPro: true,
      isAdmin: false,
      source: "demo",
    };
  }

  return {
    hasPro: false,
    isClerkPro: false,
    isDemoPro: false,
    isAdmin: false,
    source: "free",
  };
}
