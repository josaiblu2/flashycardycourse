"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { createCardRecord } from "@/db/queries/cards";
import {
  CardLanguageSchema,
  DEFAULT_GENERATION_OPTIONS,
  FlashcardFormatSchema,
  FlashcardLevelSchema,
  type GenerationContext,
  type GenerateCardsOptions,
} from "@/lib/ai/generation-context";
import { generateFlashcards } from "@/lib/ai/generate-flashcards";

const CARD_COUNT = 20;

const GenerateCardsOptionsSchema = z.object({
  language: CardLanguageSchema.default("auto"),
  customLanguage: z.string().trim().max(50).optional(),
  level: FlashcardLevelSchema.default("intermediate"),
  format: FlashcardFormatSchema.default("qa"),
});

const GenerateCardsSchema = z.object({
  deckId: z.number().int().positive(),
  options: GenerateCardsOptionsSchema.optional(),
});

type GenerateCardsInput = z.infer<typeof GenerateCardsSchema>;

function buildGenerationContext(input: {
  deckName: string;
  deckDescription: string;
  count: number;
  options?: Partial<GenerateCardsOptions>;
}): GenerationContext {
  const parsedOptions = GenerateCardsOptionsSchema.parse({
    ...DEFAULT_GENERATION_OPTIONS,
    ...input.options,
  });

  return {
    topic: input.deckName.trim(),
    scope: input.deckDescription.trim(),
    language: parsedOptions.language,
    customLanguage: parsedOptions.customLanguage,
    level: parsedOptions.level,
    format: parsedOptions.format,
    count: input.count,
  };
}

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

  if (
    parsed.data.options?.language === "other" &&
    !parsed.data.options.customLanguage?.trim()
  ) {
    throw new Error("Please specify a language for your flashcards.");
  }

  const context = buildGenerationContext({
    deckName: deck.name,
    deckDescription: deck.description,
    count: CARD_COUNT,
    options: parsed.data.options,
  });

  const generated = await generateFlashcards(context);

  for (const card of generated) {
    await createCardRecord(parsed.data.deckId, userId, card);
  }

  revalidatePath(`/deck/${parsed.data.deckId}`);
  revalidatePath(`/deck/${parsed.data.deckId}/study`);

  return { count: generated.length };
}
