import { describe, expect, it } from "vitest";
import { buildGenerationPrompt, buildReviewPrompt } from "./build-flashcard-prompts";
import { buildGenerationContext } from "./generation-context";

describe("buildGenerationPrompt", () => {
  it("includes topic, language, level, and format instructions", () => {
    const context = buildGenerationContext({
      deckName: "Dental terms",
      deckDescription: "Basic odontological vocabulary for first-year students",
      count: 5,
      options: {
        language: "spanish",
        level: "beginner",
        format: "qa",
      },
    });

    const prompt = buildGenerationPrompt(context, 5, []);

    expect(prompt).toContain("Topic: Dental terms");
    expect(prompt).toContain("Card language: Spanish");
    expect(prompt).toContain("Learner level: beginner");
    expect(prompt).toContain("question and answer");
    expect(prompt).toContain("Generate exactly 5 unique flashcards");
  });

  it("lists existing cards to avoid duplicates", () => {
    const context = buildGenerationContext({
      deckName: "History",
      deckDescription: "Roman empire",
      count: 2,
    });

    const prompt = buildGenerationPrompt(context, 2, [
      { front: "Who was Augustus?", back: "First Roman emperor." },
    ]);

    expect(prompt).toContain("Already generated");
    expect(prompt).toContain("Who was Augustus?");
  });
});

describe("buildReviewPrompt", () => {
  it("asks to review and replace low-quality cards", () => {
    const context = buildGenerationContext({
      deckName: "Nursing",
      deckDescription: "Core terminology",
      count: 2,
      options: { language: "english", format: "term-definition" },
    });

    const prompt = buildReviewPrompt(context, [
      { front: "NG tube", back: "Nasogastric tube." },
      { front: "Bad term", back: "Probably means something else." },
    ]);

    expect(prompt).toContain("Review and improve");
    expect(prompt).toContain("meta-commentary");
    expect(prompt).toContain('"cards" array must contain exactly 2 items');
  });
});

describe("buildGenerationContext", () => {
  it("applies defaults when options are omitted", () => {
    const context = buildGenerationContext({
      deckName: "Spanish verbs",
      deckDescription: "Present tense",
      count: 20,
    });

    expect(context.language).toBe("auto");
    expect(context.level).toBe("intermediate");
    expect(context.format).toBe("qa");
  });
});
