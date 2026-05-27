export type GenerateCardsDisabledReason =
  | "generating"
  | "missing-title"
  | "missing-description"
  | "missing-both";

export interface GenerateCardsWithAIDisabledState {
  disabled: boolean;
  reason: GenerateCardsDisabledReason | null;
  tooltipMessage: string | null;
}

export function getGenerateCardsWithAIDisabledState(input: {
  isPending: boolean;
  deckName: string;
  deckDescription?: string | null;
}): GenerateCardsWithAIDisabledState {
  if (input.isPending) {
    return {
      disabled: true,
      reason: "generating",
      tooltipMessage: "Generating flashcards. Please wait…",
    };
  }

  const hasTitle = input.deckName.trim().length > 0;
  const hasDescription = (input.deckDescription?.trim().length ?? 0) > 0;

  if (!hasTitle && !hasDescription) {
    return {
      disabled: true,
      reason: "missing-both",
      tooltipMessage:
        "Add a deck title and description before generating cards with AI.",
    };
  }

  if (!hasTitle) {
    return {
      disabled: true,
      reason: "missing-title",
      tooltipMessage: "Add a deck title before generating cards with AI.",
    };
  }

  if (!hasDescription) {
    return {
      disabled: true,
      reason: "missing-description",
      tooltipMessage:
        "Add a deck description before generating cards with AI.",
    };
  }

  return {
    disabled: false,
    reason: null,
    tooltipMessage: null,
  };
}
