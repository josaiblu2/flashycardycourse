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

export const GenerateCardsOptionsSchema = z.object({
  language: CardLanguageSchema.default("auto"),
  customLanguage: z.string().trim().max(50).optional(),
  level: FlashcardLevelSchema.default("intermediate"),
  format: FlashcardFormatSchema.default("qa"),
});

export type FlashcardLevel = z.infer<typeof FlashcardLevelSchema>;
export type FlashcardFormat = z.infer<typeof FlashcardFormatSchema>;
export type CardLanguage = z.infer<typeof CardLanguageSchema>;
export type GenerateCardsOptions = z.infer<typeof GenerateCardsOptionsSchema>;

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

export function buildGenerationContext(input: {
  deckName: string;
  deckDescription: string;
  count: number;
  options?: Partial<GenerateCardsOptions>;
}): GenerationContext {
  const parsedOptions = GenerateCardsOptionsSchema.parse({
    ...DEFAULT_GENERATION_OPTIONS,
    ...input.options,
  });

  return {
    topic: input.deckName.trim(),
    scope: input.deckDescription.trim(),
    language: parsedOptions.language,
    customLanguage: parsedOptions.customLanguage,
    level: parsedOptions.level,
    format: parsedOptions.format,
    count: input.count,
  };
}
