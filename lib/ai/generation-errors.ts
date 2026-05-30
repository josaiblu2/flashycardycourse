export const AI_GENERATION_ERROR_CODES = [
  "UNAUTHENTICATED",
  "INVALID_INPUT",
  "NOT_PRO",
  "USER_DAILY_LIMIT_REACHED",
  "USER_MONTHLY_LIMIT_REACHED",
  "GLOBAL_MONTHLY_LIMIT_REACHED",
  "CARD_PERSISTENCE_FAILED",
] as const;

export type AiGenerationErrorCode = (typeof AI_GENERATION_ERROR_CODES)[number];

export const AI_GENERATION_ERROR_MESSAGES: Record<
  AiGenerationErrorCode,
  string
> = {
  UNAUTHENTICATED: "You must be signed in to generate flashcards with AI.",
  INVALID_INPUT: "Invalid input. Please check your deck details and try again.",
  NOT_PRO: "AI generation requires a Pro subscription.",
  USER_DAILY_LIMIT_REACHED:
    "You have reached your daily AI generation limit for the demo version. Please try again tomorrow. Join the Pro waitlist below for expanded access.",
  USER_MONTHLY_LIMIT_REACHED:
    "You have reached your monthly AI generation limit for the demo version. Please try again next month. Join the Pro waitlist below for expanded access.",
  GLOBAL_MONTHLY_LIMIT_REACHED: `AI flashcard generation is temporarily unavailable.
FlashyCardy is currently running as a public demo and the monthly AI credits have been exhausted.
Please try again later. Join the Pro waitlist below to get notified when expanded AI access becomes available.`,
  CARD_PERSISTENCE_FAILED:
    "Flashcards were generated but some could not be saved. Please refresh the page and try again.",
};

export type GenerateCardsWithAIResult =
  | { success: true; count: number }
  | { success: false; code: AiGenerationErrorCode; message: string };

export function aiGenerationFailure(
  code: AiGenerationErrorCode,
  message?: string
): GenerateCardsWithAIResult {
  return {
    success: false,
    code,
    message: message ?? AI_GENERATION_ERROR_MESSAGES[code],
  };
}
