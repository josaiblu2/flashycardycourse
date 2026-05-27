import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";

function buildFlashcardsSchema(count: number) {
  return z.object({
    cards: z
      .array(
        z.object({
          front: z.string().min(1),
          back: z.string().min(1),
        })
      )
      .min(1)
      .max(count),
  });
}

export async function generateFlashcards(topic: string, count: number) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to your .env.local file."
    );
  }

  const collected: { front: string; back: string }[] = [];
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts && collected.length < count; attempt++) {
    const remaining = count - collected.length;

    const { output } = await generateText({
      model: openai("gpt-4o-mini"),
      output: Output.object({
        schema: buildFlashcardsSchema(remaining),
      }),
      prompt:
        attempt === 0
          ? `Generate exactly ${remaining} unique flashcards about: ${topic}. Each card must have a concise question or term on the front and the answer on the back. The "cards" array must contain exactly ${remaining} items.`
          : `Generate exactly ${remaining} more unique flashcards about: ${topic}. Do not repeat earlier cards. Each card must have a concise question or term on the front and the answer on the back. The "cards" array must contain exactly ${remaining} items.`,
    });

    collected.push(...output.cards);
  }

  if (collected.length === 0) {
    throw new Error("AI failed to generate flashcards. Please try again.");
  }

  return collected.slice(0, count);
}
