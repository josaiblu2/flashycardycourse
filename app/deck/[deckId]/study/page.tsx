import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { getCardsByDeckAndUser } from "@/db/queries/cards";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddCardDialog } from "@/components/add-card-dialog";
import { GenerateCardsWithAIButton } from "@/components/generate-cards-with-ai-button";
import { StudyFlashcards } from "@/components/study-flashcards";

export default async function StudyPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { deckId } = await params;
  const id = parseInt(deckId, 10);
  if (isNaN(id)) notFound();

  const deck = await getDeckByIdAndUser(id, userId);
  if (!deck) notFound();

  const cardRows = await getCardsByDeckAndUser(id, userId);
  const studyCards = cardRows.map(({ card }) => ({
    id: card.id,
    front: card.front,
    back: card.back,
  }));

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-5xl mx-auto w-full">
      <div className="mb-10">
        <Link
          href={`/deck/${id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-2")}
        >
          ← Back to deck
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Study: {deck.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {studyCards.length === 0
                ? "Add cards to this deck before studying"
                : `Review ${studyCards.length} ${studyCards.length === 1 ? "card" : "cards"}`}
            </p>
          </div>
          <GenerateCardsWithAIButton
            deckId={id}
            deckName={deck.name}
            deckDescription={deck.description}
          />
        </div>
      </div>

      {studyCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-medium text-foreground">No cards to study</p>
          <p className="text-muted-foreground mt-1 mb-6">
            Add flashcards to this deck, then come back to study them
          </p>
          <AddCardDialog deckId={id} />
        </div>
      ) : (
        <StudyFlashcards
          deckId={id}
          deckName={deck.name}
          cards={studyCards}
        />
      )}
    </main>
  );
}
