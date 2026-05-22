import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { getCardsByDeckAndUser } from "@/db/queries/cards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { EditCardDialog } from "@/components/edit-card-dialog";

export default async function DeckPage({
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

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/dashboard">← Back to Dashboard</Link>
        </Button>

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
          <div className="flex items-center gap-2">
            <EditDeckDialog
              deckId={deck.id}
              initialName={deck.name}
              initialDescription={deck.description}
            />
            <Button>Add Card</Button>
          </div>
        </div>
      </div>

      {cardRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-medium text-foreground">No cards yet</p>
          <p className="text-muted-foreground mt-1 mb-6">
            Add your first card to start studying
          </p>
          <Button>Add Card</Button>
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
              <div className="mx-6 border-t border-border" />
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Back
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-foreground">{card.back}</p>
              </CardContent>
              <div className="flex justify-end px-6 pb-4">
                <EditCardDialog
                  cardId={card.id}
                  deckId={id}
                  initialFront={card.front}
                  initialBack={card.back}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
