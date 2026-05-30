import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { getCardsByDeckAndUser } from "@/db/queries/cards";
import { isAdminUser } from "@/lib/admin/require-admin";
import { isUserOnWaitlist } from "@/lib/waitlist/status";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { GenerateCardsWithAIButton } from "@/components/generate-cards-with-ai-button";
import { AddCardDialog } from "@/components/add-card-dialog";
import { EditCardDialog } from "@/components/edit-card-dialog";
import { DeleteCardDialog } from "@/components/delete-card-dialog";
import { DeleteDeckDialog } from "@/components/delete-deck-dialog";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { userId, has } = await auth();
  if (!userId) redirect("/");

  const isAdmin = await isAdminUser(userId);
  const canUseAI =
    isAdmin || has({ feature: "ai_flashcard_generation" });

  const { deckId } = await params;
  const id = parseInt(deckId, 10);
  if (isNaN(id)) notFound();

  const deck = await getDeckByIdAndUser(id, userId);
  if (!deck) notFound();

  const cardRows = await getCardsByDeckAndUser(id, userId);
  const isOnWaitlist = await isUserOnWaitlist(userId);

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-2")}
        >
          ← Back to Dashboard
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {deck.name}
            </h1>
            {deck.description && (
              <p className="text-muted-foreground mt-1">{deck.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {cardRows.length} {cardRows.length === 1 ? "card" : "cards"}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {cardRows.length > 0 && (
              <Link
                href={`/deck/${id}/study`}
                className={cn(buttonVariants())}
              >
                Study
              </Link>
            )}
            <GenerateCardsWithAIButton
              deckId={id}
              deckName={deck.name}
              deckDescription={deck.description}
              existingCardCount={cardRows.length}
              canUseAI={canUseAI}
              isOnWaitlist={isOnWaitlist}
            />
            <EditDeckDialog
              deckId={deck.id}
              initialName={deck.name}
              initialDescription={deck.description}
            />
            <AddCardDialog deckId={id} />
            <DeleteDeckDialog
              deckId={id}
              deckName={deck.name}
              cardCount={cardRows.length}
            />
          </div>
        </div>
      </div>

      {cardRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-medium text-foreground">No cards yet</p>
          <p className="text-muted-foreground mt-1 mb-6">
            Add your first card to start studying
          </p>
          <AddCardDialog deckId={id} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cardRows.map(({ card }) => (
            <Card key={card.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Front
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <p className="text-foreground">{card.front}</p>
              </CardContent>
              <Separator className="mx-6" />
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Back
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-foreground">{card.back}</p>
              </CardContent>
              <div className="flex justify-end items-start px-6 pb-4 gap-1">
                <EditCardDialog
                  cardId={card.id}
                  deckId={id}
                  initialFront={card.front}
                  initialBack={card.back}
                />
                <DeleteCardDialog cardId={card.id} deckId={id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
