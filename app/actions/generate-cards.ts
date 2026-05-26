"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { createCardRecord } from "@/db/queries/cards";
import { generateFlashcards } from "@/lib/ai/generate-flashcards";

const CARD_COUNT = 20;

const GenerateCardsSchema = z.object({
  deckId: z.number().int().positive(),
});

type GenerateCardsInput = z.infer<typeof GenerateCardsSchema>;

export async function generateCardsWithAI(input: GenerateCardsInput) {
  const parsed = GenerateCardsSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId, has } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!has({ feature: "ai_flashcard_generation" })) {
    throw new Error("AI generation requires a Pro subscription.");
  }

  const deck = await getDeckByIdAndUser(parsed.data.deckId, userId);
  if (!deck) throw new Error("Deck not found");

  if (!deck.name.trim()) {
    throw new Error("Please add a deck title before generating cards with AI.");
  }
  if (!deck.description?.trim()) {
    throw new Error(
      "Please add a deck description before generating cards with AI."
    );
  }

  const topic = `${deck.name}: ${deck.description}`;

  const generated = await generateFlashcards(topic, CARD_COUNT);

  for (const card of generated) {
    await createCardRecord(parsed.data.deckId, userId, card);
  }

  revalidatePath(`/deck/${parsed.data.deckId}`);
  revalidatePath(`/deck/${parsed.data.deckId}/study`);

  return { count: generated.length };
}
