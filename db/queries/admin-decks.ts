import "server-only";

import { db } from "@/db";
import { decks } from "@/db/schema";
import { count, eq, inArray } from "drizzle-orm";

/**
 * Admin-only deck helpers. Callers must invoke `requireAdmin()` first.
 * `userId` values are target Clerk user IDs from the admin panel, not the session.
 */

export async function deleteDecksByUserId(userId: string) {
  return db.delete(decks).where(eq(decks.clerkUserId, userId)).returning();
}

export async function getDeckCountsByUserIds(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, number>();

  const rows = await db
    .select({ clerkUserId: decks.clerkUserId, deckCount: count() })
    .from(decks)
    .where(inArray(decks.clerkUserId, userIds))
    .groupBy(decks.clerkUserId);

  return new Map(rows.map((row) => [row.clerkUserId, row.deckCount]));
}
