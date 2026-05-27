import { describe, expect, it } from "vitest";
import { getGenerateCardsWithAIDisabledState } from "./generate-cards-button-state";

describe("getGenerateCardsWithAIDisabledState", () => {
  it("enables the button when deck details are complete and not generating", () => {
    expect(
      getGenerateCardsWithAIDisabledState({
        isPending: false,
        deckName: "Spanish verbs",
        deckDescription: "Common present-tense conjugations",
      })
    ).toEqual({
      disabled: false,
      reason: null,
      tooltipMessage: null,
    });
  });

  it("disables the button while generation is in progress", () => {
    const state = getGenerateCardsWithAIDisabledState({
      isPending: true,
      deckName: "Spanish verbs",
      deckDescription: "Common present-tense conjugations",
    });

    expect(state.disabled).toBe(true);
    expect(state.reason).toBe("generating");
    expect(state.tooltipMessage).toContain("Generating flashcards");
  });

  it("disables the button when both title and description are missing", () => {
    const state = getGenerateCardsWithAIDisabledState({
      isPending: false,
      deckName: "   ",
      deckDescription: "  ",
    });

    expect(state.disabled).toBe(true);
    expect(state.reason).toBe("missing-both");
    expect(state.tooltipMessage).toContain("title and description");
  });

  it("disables the button when only the title is missing", () => {
    const state = getGenerateCardsWithAIDisabledState({
      isPending: false,
      deckName: "",
      deckDescription: "Covers chapter 1 vocabulary",
    });

    expect(state.disabled).toBe(true);
    expect(state.reason).toBe("missing-title");
    expect(state.tooltipMessage).toContain("deck title");
  });

  it("disables the button when only the description is missing", () => {
    const state = getGenerateCardsWithAIDisabledState({
      isPending: false,
      deckName: "Biology basics",
      deckDescription: null,
    });

    expect(state.disabled).toBe(true);
    expect(state.reason).toBe("missing-description");
    expect(state.tooltipMessage).toContain("deck description");
  });

  it("prioritizes the generating state over missing deck details", () => {
    const state = getGenerateCardsWithAIDisabledState({
      isPending: true,
      deckName: "",
      deckDescription: null,
    });

    expect(state.reason).toBe("generating");
  });
});
