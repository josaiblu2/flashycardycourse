export const FREE_DECK_LIMIT = 3;

export type HasFeature = (
  check: { feature: string } | { plan: string }
) => boolean;

export function hasUnlimitedDecks(
  has: HasFeature,
  demoPro = false
): boolean {
  return demoPro || has({ feature: "unlimited_decks" });
}

export function hasAIFlashcardGeneration(
  has: HasFeature,
  demoPro = false
): boolean {
  return demoPro || has({ feature: "ai_flashcard_generation" });
}

export function isAtDeckLimit(
  has: HasFeature,
  deckCount: number,
  demoPro = false
): boolean {
  return !hasUnlimitedDecks(has, demoPro) && deckCount >= FREE_DECK_LIMIT;
}

export function assertCanCreateDeck(
  has: HasFeature,
  deckCount: number,
  demoPro = false
): void {
  if (hasUnlimitedDecks(has, demoPro)) return;

  if (deckCount >= FREE_DECK_LIMIT) {
    throw new Error("Deck limit reached. Upgrade to Pro.");
  }
}

export function assertHasAIFlashcardGeneration(
  has: HasFeature,
  demoPro = false
): void {
  if (!hasAIFlashcardGeneration(has, demoPro)) {
    throw new Error("AI generation requires a Pro subscription.");
  }
}
