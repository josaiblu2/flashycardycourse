import { config } from "dotenv";

config({ path: ".env.local" });
config();

const DEMO_USER_ID = "db-demo-user";

async function main() {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("@/db");
  const { cards, decks } = await import("@/db/schema");

  const [deck] = await db
    .insert(decks)
    .values({
      clerkUserId: DEMO_USER_ID,
      name: "Demo Deck",
      description: "Created by the db:demo script",
    })
    .returning();
  console.log("Created deck:", deck);

  const [card] = await db
    .insert(cards)
    .values({
      deckId: deck.id,
      front: "What is Drizzle?",
      back: "A TypeScript ORM for SQL databases",
    })
    .returning();
  console.log("Created card:", card);

  const userDecks = await db
    .select()
    .from(decks)
    .where(eq(decks.clerkUserId, DEMO_USER_ID));
  console.log("Decks for demo user:", userDecks);

  await db.delete(cards).where(eq(cards.deckId, deck.id));
  await db.delete(decks).where(eq(decks.id, deck.id));
  console.log("Cleanup complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
