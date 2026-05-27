export const FREE_DECK_LIMIT = 3;

type HasFeature = (check: { feature: string }) => boolean;

export function hasUnlimitedDecks(has: HasFeature): boolean {
  return has({ feature: "unlimited_decks" });
}

export function hasAIFlashcardGeneration(has: HasFeature): boolean {
  return has({ feature: "ai_flashcard_generation" });
}

export function isAtDeckLimit(has: HasFeature, deckCount: number): boolean {
  return !hasUnlimitedDecks(has) && deckCount >= FREE_DECK_LIMIT;
}

export function assertCanCreateDeck(has: HasFeature, deckCount: number): void {
  if (hasUnlimitedDecks(has)) return;

  if (deckCount >= FREE_DECK_LIMIT) {
    throw new Error("Deck limit reached. Upgrade to Pro.");
  }
}

export function assertHasAIFlashcardGeneration(has: HasFeature): void {
  if (!hasAIFlashcardGeneration(has)) {
    throw new Error("AI generation requires a Pro subscription.");
  }
}
