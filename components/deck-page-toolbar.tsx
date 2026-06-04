"use client";

import Link from "next/link";
import { GenerateCardsWithAIButton } from "@/components/generate-cards-with-ai-button";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { AddCardDialog } from "@/components/add-card-dialog";
import { DeleteDeckDialog } from "@/components/delete-deck-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeckPageToolbarProps {
  deckId: number;
  deckName: string;
  deckDescription?: string | null;
  cardCount: number;
  canUseAI: boolean;
  isOnWaitlist: boolean;
  billingEnabled: boolean;
  hasDemoPro: boolean;
  isClerkPro: boolean;
}

export function DeckPageToolbar({
  deckId,
  deckName,
  deckDescription,
  cardCount,
  canUseAI,
  isOnWaitlist,
  billingEnabled,
  hasDemoPro,
  isClerkPro,
}: DeckPageToolbarProps) {
  const hasCards = cardCount > 0;

  const studyLink = hasCards ? (
    <Link href={`/deck/${deckId}/study`} className={cn(buttonVariants())}>
      Study
    </Link>
  ) : null;

  const aiButton = (
    <GenerateCardsWithAIButton
      deckId={deckId}
      deckName={deckName}
      deckDescription={deckDescription}
      existingCardCount={cardCount}
      canUseAI={canUseAI}
      isOnWaitlist={isOnWaitlist}
      billingEnabled={billingEnabled}
      hasDemoPro={hasDemoPro}
      isClerkPro={isClerkPro}
    />
  );

  const editDeck = (
    <EditDeckDialog
      deckId={deckId}
      initialName={deckName}
      initialDescription={deckDescription}
    />
  );

  const addCard = <AddCardDialog deckId={deckId} />;

  const deleteDeck = (
    <DeleteDeckDialog
      deckId={deckId}
      deckName={deckName}
      cardCount={cardCount}
    />
  );

  return (
    <>
      {/* Mobile: full-width grid */}
      <div className="grid w-full grid-cols-2 gap-2 md:hidden [&_button]:min-h-10 [&_button]:w-full">
        {hasCards && (
          <Link
            href={`/deck/${deckId}/study`}
            className={cn(buttonVariants(), "col-span-2 w-full")}
          >
            Study
          </Link>
        )}
        <div className="col-span-2 [&_button]:w-full">{aiButton}</div>
        {editDeck}
        {addCard}
        {deleteDeck}
      </div>

      {/* Desktop: original horizontal toolbar */}
      <div className="hidden shrink-0 flex-wrap items-center justify-end gap-2 md:flex">
        {studyLink}
        {aiButton}
        {editDeck}
        {addCard}
        {deleteDeck}
      </div>
    </>
  );
}
