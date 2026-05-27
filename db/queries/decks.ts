import "server-only";

import { db, sql } from "@/db";
import { decks } from "@/db/schema";
import { and, count, eq } from "drizzle-orm";

type Deck = typeof decks.$inferSelect;

function mapDeckRow(row: Record<string, unknown>): Deck {
  return {
    id: row.id as number,
    clerkUserId: row.clerkUserId as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    createdAt: new Date(row.createdAt as string | Date),
    updatedAt: new Date(row.updatedAt as string | Date),
  };
}

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

export async function createDeckRecordWithDeckLimit(
  userId: string,
  name: string,
  description: string | undefined,
  deckLimit: number | null
) {
  if (deckLimit === null) {
    return createDeckRecord(userId, name, description);
  }

  const results = await sql.transaction((txn) => [
    txn`SELECT pg_advisory_xact_lock(hashtext(${userId}))`,
    txn`
      INSERT INTO decks ("clerkUserId", name, description)
      SELECT ${userId}, ${name}, ${description ?? null}
      WHERE (SELECT COUNT(*)::int FROM decks WHERE "clerkUserId" = ${userId}) < ${deckLimit}
      RETURNING *
    `,
  ]);

  const inserted = results[1];
  if (!Array.isArray(inserted) || inserted.length === 0) {
    throw new Error("Deck limit reached. Upgrade to Pro.");
  }

  return mapDeckRow(inserted[0] as Record<string, unknown>);
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

