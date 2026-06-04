import { redirect, notFound } from "next/navigation";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { getCardsByDeckAndUser } from "@/db/queries/cards";
import { getCachedAuth, getCachedProAccess } from "@/lib/auth/cached-auth";
import { isBillingEnabled } from "@/lib/billing/config";
import { hasAIFlashcardGeneration } from "@/lib/billing/entitlements";
import { isUserOnWaitlist } from "@/lib/waitlist/status";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageBackLink } from "@/components/page-back-link";
import { DeckPageToolbar } from "@/components/deck-page-toolbar";
import { AddCardDialog } from "@/components/add-card-dialog";
import { EditCardDialog } from "@/components/edit-card-dialog";
import { DeleteCardDialog } from "@/components/delete-card-dialog";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { userId, has } = await getCachedAuth();
  if (!userId) redirect("/");

  const { deckId } = await params;
  const id = parseInt(deckId, 10);
  if (isNaN(id)) notFound();

  const billingEnabled = isBillingEnabled();
  const proAccess = await getCachedProAccess();
  const canUseAI =
    proAccess.isAdmin ||
    hasAIFlashcardGeneration(has, proAccess.isDemoPro);

  const [deck, cardRows, isOnWaitlist] = await Promise.all([
    getDeckByIdAndUser(id, userId),
    getCardsByDeckAndUser(id, userId),
    isUserOnWaitlist(userId),
  ]);
  if (!deck) notFound();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <PageBackLink
        href="/dashboard"
        label="Back to Dashboard"
        shortLabel="Dashboard"
      />

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="min-w-0 md:max-w-[min(100%,42rem)]">
          <h1 className="text-2xl font-bold tracking-tight text-foreground break-words sm:text-3xl">
            {deck.name}
          </h1>
          {deck.description && (
            <p className="mt-1 text-muted-foreground break-words">
              {deck.description}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {cardRows.length} {cardRows.length === 1 ? "card" : "cards"}
          </p>
        </div>
        <DeckPageToolbar
          deckId={id}
          deckName={deck.name}
          deckDescription={deck.description}
          cardCount={cardRows.length}
          canUseAI={canUseAI}
          isOnWaitlist={isOnWaitlist}
          billingEnabled={billingEnabled}
          hasDemoPro={proAccess.isDemoPro}
          isClerkPro={proAccess.isClerkPro}
        />
      </div>

      {cardRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-16 text-center sm:py-20">
          <p className="text-lg font-medium text-foreground">No cards yet</p>
          <p className="mt-1 text-muted-foreground mb-6">
            Add your first card to start studying
          </p>
          <AddCardDialog deckId={id} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cardRows.map(({ card }) => (
            <Card key={card.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Front
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <p className="text-foreground break-words whitespace-pre-wrap">
                  {card.front}
                </p>
              </CardContent>
              <Separator className="mx-4 sm:mx-6" />
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Back
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-foreground break-words whitespace-pre-wrap">
                  {card.back}
                </p>
              </CardContent>
              <div className="flex items-center justify-end gap-1 px-4 pb-4 sm:px-6">
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
