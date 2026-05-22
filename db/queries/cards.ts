import { db } from "@/db";
import { cards, decks } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function getCardsByDeckAndUser(deckId: number, userId: string) {
  return db
    .select({ card: cards })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(cards.deckId, deckId), eq(decks.clerkUserId, userId)))
    .orderBy(desc(cards.updatedAt));
}

export async function updateCardRecord(
  cardId: number,
  deckId: number,
  userId: string,
  data: { front?: string; back?: string }
) {
  const [deck] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)));
  if (!deck) return null;

  const [updated] = await db
    .update(cards)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(cards.id, cardId), eq(cards.deckId, deckId)))
    .returning();
  return updated ?? null;
}
