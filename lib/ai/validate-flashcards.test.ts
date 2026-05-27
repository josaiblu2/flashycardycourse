import { describe, expect, it } from "vitest";
import {
  dedupeFlashcards,
  filterValidFlashcards,
  isValidFlashcard,
  sanitizeFlashcards,
} from "./validate-flashcards";

describe("isValidFlashcard", () => {
  it("accepts well-formed cards", () => {
    expect(
      isValidFlashcard({
        front: "¿Qué es la placa dental?",
        back: "Película adherente de bacterias sobre los dientes.",
      })
    ).toBe(true);
  });

  it("rejects meta-commentary on the back", () => {
    expect(
      isValidFlashcard({
        front: "¿Qué es la felación dentaria?",
        back: "Término incorrecto, probablemente se refiere a filación.",
      })
    ).toBe(false);
  });

  it("rejects identical front and back", () => {
    expect(
      isValidFlashcard({
        front: "Placa dental",
        back: "Placa dental",
      })
    ).toBe(false);
  });
});

describe("dedupeFlashcards", () => {
  it("removes cards with duplicate fronts", () => {
    const result = dedupeFlashcards([
      { front: "Placa dental", back: "Definición A" },
      { front: "placa dental", back: "Definición B" },
      { front: "Molar", back: "Diente posterior." },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]?.front).toBe("Placa dental");
    expect(result[1]?.front).toBe("Molar");
  });
});

describe("sanitizeFlashcards", () => {
  it("filters invalid cards and deduplicates", () => {
    const result = sanitizeFlashcards([
      { front: "Good", back: "Valid answer here." },
      { front: "Good", back: "Duplicate front." },
      {
        front: "Bad",
        back: "This term is wrong and does not exist.",
      },
    ]);

    expect(result).toEqual([{ front: "Good", back: "Valid answer here." }]);
  });

  it("preserves order of first valid unique cards", () => {
    const result = filterValidFlashcards([
      { front: "First?", back: "Answer one." },
      { front: "Second?", back: "Answer two." },
    ]);

    expect(result).toHaveLength(2);
  });
});
