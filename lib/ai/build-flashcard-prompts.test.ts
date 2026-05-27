import { describe, expect, it } from "vitest";
import { buildGenerationPrompt, buildReviewPrompt } from "./build-flashcard-prompts";
import type { GenerationContext } from "./generation-context";

function createContext(
  overrides: Partial<GenerationContext> = {}
): GenerationContext {
  return {
    topic: "Topic",
    scope: "Scope",
    language: "auto",
    level: "intermediate",
    format: "qa",
    count: 20,
    ...overrides,
  };
}

describe("buildGenerationPrompt", () => {
  it("includes topic, language, level, and format instructions", () => {
    const context = createContext({
      topic: "Dental terms",
      scope: "Basic odontological vocabulary for first-year students",
      count: 5,
      language: "spanish",
      level: "beginner",
      format: "qa",
    });

    const prompt = buildGenerationPrompt(context, 5, []);

    expect(prompt).toContain("Topic: Dental terms");
    expect(prompt).toContain("Card language: Spanish");
    expect(prompt).toContain("Learner level: beginner");
    expect(prompt).toContain("question and answer");
    expect(prompt).toContain("Generate exactly 5 unique flashcards");
  });

  it("lists existing cards to avoid duplicates", () => {
    const context = createContext({
      topic: "History",
      scope: "Roman empire",
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
    const context = createContext({
      topic: "Nursing",
      scope: "Core terminology",
      count: 2,
      language: "english",
      format: "term-definition",
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
