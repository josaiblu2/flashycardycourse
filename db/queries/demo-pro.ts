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

/** Cached per request — pro-access and dashboard share one DB read. */
export const getDemoProActivationByUser = cache(fetchDemoProActivationByUser);

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
