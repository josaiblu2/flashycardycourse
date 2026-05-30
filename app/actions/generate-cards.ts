"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import {
  createCardRecordsForDeck,
  getCardsByDeckAndUser,
} from "@/db/queries/cards";
import {
  aiGenerationFailure,
  type GenerateCardsWithAIResult,
} from "@/lib/ai/generation-errors";
import {
  CardLanguageSchema,
  DEFAULT_GENERATION_OPTIONS,
  FlashcardFormatSchema,
  FlashcardLevelSchema,
  type GenerationContext,
  type GenerateCardsOptions,
} from "@/lib/ai/generation-context";
import { generateFlashcards } from "@/lib/ai/generate-flashcards";
import { reserveAiGenerationWithinLimits } from "@/lib/ai/usage-limits";
import { isAdminUser } from "@/lib/admin/require-admin";

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

export async function generateCardsWithAI(
  input: GenerateCardsInput
): Promise<GenerateCardsWithAIResult> {
  const { userId, has } = await auth();
  if (!userId) {
    return aiGenerationFailure("UNAUTHENTICATED");
  }

  const parsed = GenerateCardsSchema.safeParse(input);
  if (!parsed.success) {
    return aiGenerationFailure("INVALID_INPUT");
  }

  const deck = await getDeckByIdAndUser(parsed.data.deckId, userId);
  if (!deck) {
    return aiGenerationFailure(
      "INVALID_INPUT",
      "Deck not found."
    );
  }

  if (!deck.name.trim()) {
    return aiGenerationFailure(
      "INVALID_INPUT",
      "Please add a deck title before generating cards with AI."
    );
  }
  if (!deck.description?.trim()) {
    return aiGenerationFailure(
      "INVALID_INPUT",
      "Please add a deck description before generating cards with AI."
    );
  }

  if (
    parsed.data.options?.language === "other" &&
    !parsed.data.options.customLanguage?.trim()
  ) {
    return aiGenerationFailure(
      "INVALID_INPUT",
      "Please specify a language for your flashcards."
    );
  }

  const isAdmin = await isAdminUser(userId);

  if (!isAdmin) {
    if (!has({ feature: "ai_flashcard_generation" })) {
      return aiGenerationFailure("NOT_PRO");
    }

    const limitFailure = await reserveAiGenerationWithinLimits(
      userId,
      parsed.data.deckId
    );
    if (limitFailure) {
      return limitFailure;
    }
  }

  const context = buildGenerationContext({
    deckName: deck.name,
    deckDescription: deck.description,
    count: CARD_COUNT,
    options: parsed.data.options,
  });

  const existingCards = (
    await getCardsByDeckAndUser(parsed.data.deckId, userId)
  ).map(({ card }) => ({
    front: card.front,
    back: card.back,
  }));

  let generated;
  try {
    generated = await generateFlashcards(context, existingCards);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate cards.";
    return aiGenerationFailure("INVALID_INPUT", message);
  }

  const { inserted, failedCount, deckMissing } = await createCardRecordsForDeck(
    parsed.data.deckId,
    userId,
    generated
  );

  if (deckMissing) {
    return aiGenerationFailure(
      "CARD_PERSISTENCE_FAILED",
      "Deck not found while saving generated cards. Your AI usage was recorded. Please refresh and try again."
    );
  }

  if (failedCount > 0 || inserted.length === 0) {
    const saved = inserted.length;
    const total = generated.length;
    return aiGenerationFailure(
      "CARD_PERSISTENCE_FAILED",
      saved > 0
        ? `Generated ${total} flashcards but only ${saved} were saved. Please refresh the deck and try again if cards are missing. Your AI usage was recorded.`
        : "Flashcards were generated but could not be saved. Please refresh and try again. Your AI usage was recorded."
    );
  }

  revalidatePath(`/deck/${parsed.data.deckId}`);
  revalidatePath(`/deck/${parsed.data.deckId}/study`);

  return { success: true, count: inserted.length };
}
