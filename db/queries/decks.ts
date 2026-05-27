import { db } from "@/db";
import { decks } from "@/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";

export const FREE_DECK_LIMIT = 3;

export async function getDecksByUser(userId: string) {
  return db.select().from(decks).where(eq(decks.clerkUserId, userId));
}

export async function getDeckCountByUser(userId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(decks)
    .where(eq(decks.clerkUserId, userId));
  return result?.count ?? 0;
}

export async function getDeckByIdAndUser(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)));
  return deck ?? null;
}

export async function createDeckRecord(
  userId: string,
  name: string,
  description?: string
) {
  const [deck] = await db
    .insert(decks)
    .values({ clerkUserId: userId, name, description })
    .returning();
  return deck;
}

export async function updateDeckRecord(
  deckId: number,
  userId: string,
  data: { name?: string; description?: string }
) {
  const [deck] = await db
    .update(decks)
    .set(data)
    .where(and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)))
    .returning();
  return deck ?? null;
}

export async function deleteDeckRecord(deckId: number, userId: string) {
  const [deck] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)));
  if (!deck) return null;

  const [deleted] = await db
    .delete(decks)
    .where(and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)))
    .returning();
  return deleted ?? null;
}

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
