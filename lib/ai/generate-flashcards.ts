import { generateText, Output } from "ai";
import { z } from "zod";

const GeneratedFlashcardsSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().min(1),
      back: z.string().min(1),
    })
  ),
});

export async function generateFlashcards(topic: string, count: number) {
  const { output } = await generateText({
    model: "openai/gpt-5.3-chat",
    output: Output.object({
      schema: GeneratedFlashcardsSchema,
    }),
    prompt: `Generate exactly ${count} flashcards about: ${topic}. Put a concise question or term on the front and the answer on the back. Return only the structured object.`,
  });

  if (output.cards.length !== count) {
    throw new Error("AI returned an unexpected number of cards");
  }

  return output.cards;
}
