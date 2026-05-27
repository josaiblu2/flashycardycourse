import type { Flashcard } from "./generation-context";

const META_PATTERNS = [
  /incorrect(?:o|a)?\s+(?:term|t[eé]rmino)/i,
  /wrong term/i,
  /does not exist/i,
  /no existe/i,
  /probably (?:means|refers)/i,
  /probablemente se refiere/i,
  /this term is wrong/i,
  /t[eé]rmino incorrecto/i,
  /not a (?:real|valid|standard)/i,
  /may refer to/i,
  /might refer to/i,
  /likely refers/i,
  /possibly means/i,
  /quiz[aá]\s+(?:se refiere|significa)/i,
];

const MIN_FRONT_LENGTH = 2;
const MIN_BACK_LENGTH = 4;
const MAX_FRONT_LENGTH = 300;
const MAX_BACK_LENGTH = 600;

function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasMetaCommentary(text: string): boolean {
  return META_PATTERNS.some((pattern) => pattern.test(text));
}

export function isValidFlashcard(card: Flashcard): boolean {
  const front = card.front.trim();
  const back = card.back.trim();

  if (front.length < MIN_FRONT_LENGTH || back.length < MIN_BACK_LENGTH) {
    return false;
  }

  if (front.length > MAX_FRONT_LENGTH || back.length > MAX_BACK_LENGTH) {
    return false;
  }

  if (hasMetaCommentary(back) || hasMetaCommentary(front)) {
    return false;
  }

  if (front.toLowerCase() === back.toLowerCase()) {
    return false;
  }

  return true;
}

export function filterValidFlashcards(cards: Flashcard[]): Flashcard[] {
  return cards.filter(isValidFlashcard);
}

export function dedupeFlashcards(cards: Flashcard[]): Flashcard[] {
  const seen = new Set<string>();
  const result: Flashcard[] = [];

  for (const card of cards) {
    const key = normalizeForComparison(card.front);
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push({
      front: card.front.trim(),
      back: card.back.trim(),
    });
  }

  return result;
}

export function sanitizeFlashcards(cards: Flashcard[]): Flashcard[] {
  return dedupeFlashcards(filterValidFlashcards(cards));
}
