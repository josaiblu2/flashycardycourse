import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import {
  buildGenerationPrompt,
  buildReviewPrompt,
  getFlashcardSystemPrompt,
} from "./build-flashcard-prompts";
import {
  FLASHCARD_BATCH_SIZE,
  type Flashcard,
  type GenerationContext,
} from "./generation-context";
import { sanitizeFlashcards } from "./validate-flashcards";

const GENERATION_MODEL = openai("gpt-4o-mini");
const REVIEW_MODEL = openai("gpt-4o-mini");
const GENERATION_TEMPERATURE = 0.4;
const MAX_BATCH_ATTEMPTS = 3;
const MAX_REVIEW_ATTEMPTS = 2;

function buildFlashcardsSchema(count: number) {
  return z.object({
    cards: z
      .array(
        z.object({
          front: z.string().min(1),
          back: z.string().min(1),
        })
      )
      .length(count),
  });
}

function assertOpenAiKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to your .env.local file."
    );
  }
}

async function generateBatch(
  context: GenerationContext,
  count: number,
  existingCards: Flashcard[]
): Promise<Flashcard[]> {
  const { output } = await generateText({
    model: GENERATION_MODEL,
    system: getFlashcardSystemPrompt(),
    temperature: GENERATION_TEMPERATURE,
    output: Output.object({
      schema: buildFlashcardsSchema(count),
    }),
    prompt: buildGenerationPrompt(context, count, existingCards),
  });

  return output.cards;
}

async function reviewFlashcards(
  context: GenerationContext,
  cards: Flashcard[]
): Promise<Flashcard[]> {
  if (cards.length === 0) {
    return cards;
  }

  const { output } = await generateText({
    model: REVIEW_MODEL,
    system: getFlashcardSystemPrompt(),
    temperature: 0.2,
    output: Output.object({
      schema: buildFlashcardsSchema(cards.length),
    }),
    prompt: buildReviewPrompt(context, cards),
  });

  return output.cards;
}

export async function generateFlashcards(
  context: GenerationContext
): Promise<Flashcard[]> {
  assertOpenAiKey();

  const collected: Flashcard[] = [];
  const targetCount = context.count;

  while (collected.length < targetCount) {
    const remaining = Math.min(
      FLASHCARD_BATCH_SIZE,
      targetCount - collected.length
    );
    let batch: Flashcard[] = [];

    for (let attempt = 0; attempt < MAX_BATCH_ATTEMPTS; attempt++) {
      try {
        const generated = await generateBatch(context, remaining, collected);
        batch = sanitizeFlashcards(generated);

        if (batch.length >= remaining) {
          batch = batch.slice(0, remaining);
          break;
        }
      } catch {
        // Retry when the model returns invalid structured output.
      }
    }

    if (batch.length === 0) {
      break;
    }

    collected.push(...batch);
    collected.splice(0, collected.length, ...sanitizeFlashcards(collected));
  }

  if (collected.length === 0) {
    throw new Error("AI failed to generate flashcards. Please try again.");
  }

  let reviewed = collected.slice(0, targetCount);

  for (let attempt = 0; attempt < MAX_REVIEW_ATTEMPTS; attempt++) {
    try {
      const reviewedBatch = await reviewFlashcards(context, reviewed);
      const cleaned = sanitizeFlashcards(reviewedBatch);

      if (cleaned.length >= reviewed.length) {
        reviewed = cleaned.slice(0, targetCount);
        break;
      }

      reviewed = cleaned;
    } catch {
      break;
    }
  }

  reviewed = sanitizeFlashcards(reviewed).slice(0, targetCount);

  if (reviewed.length < targetCount) {
    const missing = targetCount - reviewed.length;

    for (
      let attempt = 0;
      attempt < MAX_BATCH_ATTEMPTS && reviewed.length < targetCount;
      attempt++
    ) {
      try {
        const remaining = targetCount - reviewed.length;
        const generated = await generateBatch(context, remaining, reviewed);
        reviewed = sanitizeFlashcards([...reviewed, ...generated]).slice(
          0,
          targetCount
        );
      } catch {
        break;
      }
    }

    if (reviewed.length < targetCount && missing > 0) {
      // Accept fewer cards only if we could not fill gaps after retries.
    }
  }

  if (reviewed.length === 0) {
    throw new Error("AI failed to generate flashcards. Please try again.");
  }

  return reviewed;
}
