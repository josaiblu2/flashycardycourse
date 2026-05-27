import { describe, expect, it } from "vitest";
import { getGenerateCardsWithAIDisabledState } from "./generate-cards-button-state";

describe("getGenerateCardsWithAIDisabledState", () => {
  it("disables while generation is pending", () => {
    const state = getGenerateCardsWithAIDisabledState({
      isPending: true,
      deckName: "Topic",
      deckDescription: "Scope",
    });

    expect(state.disabled).toBe(true);
    expect(state.reason).toBe("generating");
  });

  it("requires both title and description", () => {
    const state = getGenerateCardsWithAIDisabledState({
      isPending: false,
      deckName: "   ",
      deckDescription: "   ",
    });

    expect(state.disabled).toBe(true);
    expect(state.reason).toBe("missing-both");
  });

  it("enables when deck metadata is present", () => {
    const state = getGenerateCardsWithAIDisabledState({
      isPending: false,
      deckName: "Spanish verbs",
      deckDescription: "Present tense",
    });

    expect(state.disabled).toBe(false);
    expect(state.reason).toBeNull();
  });
});
