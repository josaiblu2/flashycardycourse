import { z } from "zod";

export const FlashcardLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);
export const FlashcardFormatSchema = z.enum([
  "qa",
  "term-definition",
  "translation",
]);
export const CardLanguageSchema = z.enum([
  "auto",
  "english",
  "spanish",
  "french",
  "german",
  "portuguese",
  "italian",
  "japanese",
  "chinese",
  "korean",
  "other",
]);

export type FlashcardLevel = z.infer<typeof FlashcardLevelSchema>;
export type FlashcardFormat = z.infer<typeof FlashcardFormatSchema>;
export type CardLanguage = z.infer<typeof CardLanguageSchema>;

export type GenerateCardsOptions = {
  language: CardLanguage;
  customLanguage?: string;
  level: FlashcardLevel;
  format: FlashcardFormat;
};

export type Flashcard = {
  front: string;
  back: string;
};

export type GenerationContext = {
  topic: string;
  scope: string;
  language: CardLanguage;
  customLanguage?: string;
  level: FlashcardLevel;
  format: FlashcardFormat;
  count: number;
};

export const DEFAULT_GENERATION_OPTIONS: GenerateCardsOptions = {
  language: "auto",
  level: "intermediate",
  format: "qa",
};

export const CARD_LANGUAGE_OPTIONS: {
  value: CardLanguage;
  label: string;
}[] = [
  { value: "auto", label: "Auto (match topic language)" },
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "portuguese", label: "Portuguese" },
  { value: "italian", label: "Italian" },
  { value: "japanese", label: "Japanese" },
  { value: "chinese", label: "Chinese" },
  { value: "korean", label: "Korean" },
  { value: "other", label: "Other…" },
];

export const FLASHCARD_LEVEL_OPTIONS: {
  value: FlashcardLevel;
  label: string;
}[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const FLASHCARD_FORMAT_OPTIONS: {
  value: FlashcardFormat;
  label: string;
  description: string;
}[] = [
  {
    value: "qa",
    label: "Question & answer",
    description: "A question on the front, a concise answer on the back",
  },
  {
    value: "term-definition",
    label: "Term & definition",
    description: "A key term on the front, a clear definition on the back",
  },
  {
    value: "translation",
    label: "Translation",
    description: "Source text on the front, translation on the back",
  },
];

export const FLASHCARD_BATCH_SIZE = 6;

/** Max deck cards included in the AI prompt to avoid duplicates. */
export const MAX_EXISTING_CARDS_IN_PROMPT = 120;

export function getExistingCardsGenerationNotice(
  existingCardCount: number
): string | null {
  if (existingCardCount <= 0) {
    return null;
  }

  const cardLabel = existingCardCount === 1 ? "card" : "cards";

  if (existingCardCount <= MAX_EXISTING_CARDS_IN_PROMPT) {
    return `This deck already has ${existingCardCount} ${cardLabel}. AI will generate only new concepts and skip anything that matches them.`;
  }

  return `This deck already has ${existingCardCount} ${cardLabel}. The ${MAX_EXISTING_CARDS_IN_PROMPT} most recent are sent to the AI so it avoids duplicates; server-side checks cover the rest.`;
}

const LANGUAGE_LABELS: Record<
  Exclude<CardLanguage, "auto" | "other">,
  string
> = {
  english: "English",
  spanish: "Spanish",
  french: "French",
  german: "German",
  portuguese: "Portuguese",
  italian: "Italian",
  japanese: "Japanese",
  chinese: "Chinese",
  korean: "Korean",
};

export function resolveCardLanguage(context: GenerationContext): string {
  if (context.language === "auto") {
    return "the same language as the topic and scope text";
  }

  if (context.language === "other") {
    return context.customLanguage?.trim() || "English";
  }

  return LANGUAGE_LABELS[context.language];
}
