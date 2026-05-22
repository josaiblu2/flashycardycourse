"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateDeckRecord } from "@/db/queries/decks";

const UpdateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;

export async function updateDeck(input: UpdateDeckInput) {
  const parsed = UpdateDeckSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const deck = await updateDeckRecord(parsed.data.deckId, userId, {
    name: parsed.data.name,
    description: parsed.data.description,
  });

  if (!deck) throw new Error("Deck not found");

  revalidatePath(`/deck/${parsed.data.deckId}`);
  revalidatePath("/dashboard");

  return deck;
}
