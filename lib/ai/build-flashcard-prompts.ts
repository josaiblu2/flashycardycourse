import type { Flashcard, GenerationContext } from "./generation-context";
import {
  MAX_EXISTING_CARDS_IN_PROMPT,
  resolveCardLanguage,
} from "./generation-context";

const SYSTEM_PROMPT = `You are an expert educator who creates accurate, high-quality flashcards for any subject and language.
Adapt terminology, depth, and style to the learner's topic, level, and chosen format.
Prioritize factual accuracy over quantity. Never invent terms or concepts.
Never include meta-commentary in card backs (no disclaimers, corrections, or uncertainty).`;

function formatInstructions(format: GenerationContext["format"]): string {
  switch (format) {
    case "qa":
      return `Format: question and answer.
- Front: a complete, grammatically correct question ending with "?".
- Back: a concise, factual answer in 1-2 sentences.`;
    case "term-definition":
      return `Format: term and definition.
- Front: a key term or concept (not a full question).
- Back: a clear, accurate definition in 1-2 sentences.`;
    case "translation":
      return `Format: translation pair.
- Front: a word or short phrase in the source language.
- Back: the accurate translation in the target language.
- Use the scope notes to infer source/target languages when needed.`;
  }
}

function levelInstructions(level: GenerationContext["level"]): string {
  switch (level) {
    case "beginner":
      return "Learner level: beginner — use simple vocabulary and foundational concepts.";
    case "intermediate":
      return "Learner level: intermediate — use standard terminology with moderate depth.";
    case "advanced":
      return "Learner level: advanced — use precise, domain-specific terminology where appropriate.";
  }
}

function sharedRules(context: GenerationContext): string {
  const cardLanguage = resolveCardLanguage(context);

  return `Topic: ${context.topic}
Scope and notes: ${context.scope}
Card language: ${cardLanguage}
${levelInstructions(context.level)}

${formatInstructions(context.format)}

Quality rules:
- Write ALL card text in ${cardLanguage} with correct grammar, spelling, and punctuation.
- Use standard, widely accepted terminology for this subject.
- Do not invent terms. If unsure about a term, skip it and choose a different concept.
- Back side: factual content only — never write phrases like "incorrect term", "probably means", "does not exist", or similar disclaimers.
- Keep the same format for every card.
- Avoid duplicate or near-duplicate concepts.`;
}

function formatExistingCardsSection(existingCards: Flashcard[]): string {
  if (existingCards.length === 0) {
    return "";
  }

  const cardsForPrompt = existingCards.slice(0, MAX_EXISTING_CARDS_IN_PROMPT);
  const truncatedNote =
    existingCards.length > MAX_EXISTING_CARDS_IN_PROMPT
      ? `\n(${existingCards.length - MAX_EXISTING_CARDS_IN_PROMPT} more cards already exist in this deck — avoid repeating any of them.)`
      : "";

  return `\nAlready present in this deck (do not repeat these concepts):
${cardsForPrompt
  .map((card) => `- Front: ${card.front} | Back: ${card.back}`)
  .join("\n")}${truncatedNote}\n`;
}

export function buildGenerationPrompt(
  context: GenerationContext,
  count: number,
  existingCards: Flashcard[]
): string {
  return `${sharedRules(context)}
${formatExistingCardsSection(existingCards)}
Generate exactly ${count} unique flashcards.
The "cards" array must contain exactly ${count} items.`;
}

export function buildReviewPrompt(
  context: GenerationContext,
  cards: Flashcard[],
  existingDeckCards: Flashcard[] = []
): string {
  const cardLanguage = resolveCardLanguage(context);

  return `${sharedRules(context)}
${formatExistingCardsSection(existingDeckCards)}
Review and improve the flashcards below for the given topic and language.
- Fix grammar and spelling on every card.
- Remove or rewrite cards with invented, uncertain, or non-standard terms.
- Remove cards whose backs contain meta-commentary or disclaimers.
- Ensure every card follows the required format consistently.
- Drop low-quality cards rather than keeping them.

Return only valid cards. If you remove cards, replace them with new high-quality cards about the same topic so the total remains ${cards.length}.

Flashcards to review:
${JSON.stringify(cards, null, 2)}

The "cards" array must contain exactly ${cards.length} items. All text must remain in ${cardLanguage}.`;
}

export function getFlashcardSystemPrompt(): string {
  return SYSTEM_PROMPT;
}
