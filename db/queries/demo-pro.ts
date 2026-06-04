import "server-only";

import { cache } from "react";
import { db } from "@/db";
import { demoProActivations } from "@/db/schema";
import { eq } from "drizzle-orm";

async function fetchDemoProActivationByUser(clerkUserId: string) {
  const [row] = await db
    .select()
    .from(demoProActivations)
    .where(eq(demoProActivations.clerkUserId, clerkUserId));
  return row ?? null;
}

/** Always hits the DB — use after writes or in mutation paths. */
export async function getDemoProActivationByUser(clerkUserId: string) {
  return fetchDemoProActivationByUser(clerkUserId);
}

/** Cached per request — read-only dedupe (e.g. resolveProAccess in layout + page). */
export const getCachedDemoProActivationByUser = cache(fetchDemoProActivationByUser);

export async function activateDemoProRecord(clerkUserId: string) {
  const existing = await getDemoProActivationByUser(clerkUserId);
  if (existing) return existing;

  const [row] = await db
    .insert(demoProActivations)
    .values({ clerkUserId })
    .returning();
  return row;
}

export async function dismissDemoProWaitlistReminder(clerkUserId: string) {
  const [row] = await db
    .update(demoProActivations)
    .set({
      waitlistReminderDismissedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(demoProActivations.clerkUserId, clerkUserId))
    .returning();
  return row ?? null;
}
