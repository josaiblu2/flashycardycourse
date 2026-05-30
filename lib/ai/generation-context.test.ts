import { describe, expect, it } from "vitest";
import {
  getExistingCardsGenerationNotice,
  MAX_EXISTING_CARDS_IN_PROMPT,
} from "./generation-context";

describe("getExistingCardsGenerationNotice", () => {
  it("returns null when the deck has no cards", () => {
    expect(getExistingCardsGenerationNotice(0)).toBeNull();
  });

  it("describes a single existing card", () => {
    expect(getExistingCardsGenerationNotice(1)).toContain("1 card");
  });

  it("describes multiple existing cards within the prompt limit", () => {
    const notice = getExistingCardsGenerationNotice(12);

    expect(notice).toContain("12 cards");
    expect(notice).not.toContain("most recent");
  });

  it("notes truncation when the deck exceeds the prompt limit", () => {
    const notice = getExistingCardsGenerationNotice(
      MAX_EXISTING_CARDS_IN_PROMPT + 25
    );

    expect(notice).toContain(`${MAX_EXISTING_CARDS_IN_PROMPT} most recent`);
    expect(notice).toContain(`${MAX_EXISTING_CARDS_IN_PROMPT + 25} cards`);
  });
});
