"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createCardRecord, updateCardRecord, deleteCardRecord } from "@/db/queries/cards";
import {
  CARD_BACK_MAX_LENGTH,
  CARD_FRONT_MAX_LENGTH,
} from "@/lib/cards/limits";

const CreateCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z
    .string()
    .min(1, "Front is required")
    .max(CARD_FRONT_MAX_LENGTH, `Front must be at most ${CARD_FRONT_MAX_LENGTH} characters`),
  back: z
    .string()
    .min(1, "Back is required")
    .max(CARD_BACK_MAX_LENGTH, `Back must be at most ${CARD_BACK_MAX_LENGTH} characters`),
});

type CreateCardInput = z.infer<typeof CreateCardSchema>;

export async function createCard(input: CreateCardInput) {
  const parsed = CreateCardSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const card = await createCardRecord(parsed.data.deckId, userId, {
    front: parsed.data.front,
    back: parsed.data.back,
  });

  if (!card) throw new Error("Deck not found");

  revalidatePath(`/deck/${parsed.data.deckId}`);

  return card;
}

const UpdateCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
  front: z
    .string()
    .min(1, "Front is required")
    .max(CARD_FRONT_MAX_LENGTH, `Front must be at most ${CARD_FRONT_MAX_LENGTH} characters`),
  back: z
    .string()
    .min(1, "Back is required")
    .max(CARD_BACK_MAX_LENGTH, `Back must be at most ${CARD_BACK_MAX_LENGTH} characters`),
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

const DeleteCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
});

type DeleteCardInput = z.infer<typeof DeleteCardSchema>;

export async function deleteCard(input: DeleteCardInput) {
  const parsed = DeleteCardSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const card = await deleteCardRecord(
    parsed.data.cardId,
    parsed.data.deckId,
    userId
  );

  if (!card) throw new Error("Card not found");

  revalidatePath(`/deck/${parsed.data.deckId}`);

  return card;
}
