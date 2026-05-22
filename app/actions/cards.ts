"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateCardRecord } from "@/db/queries/cards";

const UpdateCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
});

type UpdateCardInput = z.infer<typeof UpdateCardSchema>;

export async function updateCard(input: UpdateCardInput) {
  const parsed = UpdateCardSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const card = await updateCardRecord(
    parsed.data.cardId,
    parsed.data.deckId,
    userId,
    { front: parsed.data.front, back: parsed.data.back }
  );

  if (!card) throw new Error("Card not found");

  revalidatePath(`/deck/${parsed.data.deckId}`);

  return card;
}
