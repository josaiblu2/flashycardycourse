import { db } from "@/db";
import { decks } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getDecksByUser(userId: string) {
  return db.select().from(decks).where(eq(decks.clerkUserId, userId));
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
