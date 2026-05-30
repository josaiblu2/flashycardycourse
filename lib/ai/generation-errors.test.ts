import { describe, expect, it } from "vitest";
import {
  AI_GENERATION_ERROR_MESSAGES,
  aiGenerationFailure,
} from "./generation-errors";

describe("aiGenerationFailure", () => {
  it("returns typed failure with default message", () => {
    const result = aiGenerationFailure("USER_DAILY_LIMIT_REACHED");

    expect(result).toEqual({
      success: false,
      code: "USER_DAILY_LIMIT_REACHED",
      message: AI_GENERATION_ERROR_MESSAGES.USER_DAILY_LIMIT_REACHED,
    });
  });

  it("allows custom message override", () => {
    const result = aiGenerationFailure("INVALID_INPUT", "Deck not found.");

    expect(result.success).toBe(false);
    expect(result).toMatchObject({
      code: "INVALID_INPUT",
      message: "Deck not found.",
    });
  });
});
