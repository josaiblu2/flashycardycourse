import "server-only";

import { reserveAiGenerationUsageRecord } from "@/db/queries/ai-generation-usage";
import {
  aiGenerationFailure,
  type GenerateCardsWithAIResult,
} from "@/lib/ai/generation-errors";
import { getAiUsageLimits } from "@/lib/ai/usage-limit-config";

export async function reserveAiGenerationWithinLimits(
  clerkUserId: string,
  deckId: number
): Promise<GenerateCardsWithAIResult | null> {
  const limits = getAiUsageLimits();
  const result = await reserveAiGenerationUsageRecord(
    clerkUserId,
    deckId,
    limits
  );

  if (result.success) {
    return null;
  }

  return aiGenerationFailure(result.code);
}
