"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { deleteDeckRecord } from "@/db/queries/decks";

const DeleteDeckSchema = z.object({
  deckId: z.number().int().positive(),
});

type DeleteDeckInput = z.infer<typeof DeleteDeckSchema>;

export async function deleteDeck(input: DeleteDeckInput) {
  const parsed = DeleteDeckSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const deck = await deleteDeckRecord(parsed.data.deckId, userId);
  if (!deck) throw new Error("Deck not found");

  revalidatePath("/dashboard");
  revalidatePath(`/deck/${parsed.data.deckId}`);

  return deck;
}
