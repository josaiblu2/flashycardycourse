import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { getCardsByDeckAndUser } from "@/db/queries/cards";
import { PageBackLink } from "@/components/page-back-link";
import { AddCardDialog } from "@/components/add-card-dialog";
import { StudyFlashcards } from "@/components/study-flashcards";

export default async function StudyPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const t = await getTranslations("study");

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
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <PageBackLink
        href={`/deck/${id}`}
        label={t("backToDeck")}
        shortLabel={t("deckShort")}
      />

      <div className="mb-6 min-w-0 sm:mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t("studyMode")}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground break-words sm:text-3xl">
          {deck.name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {studyCards.length === 0
            ? t("addCardsBeforeStudying")
            : t("reviewCards", { count: studyCards.length })}
        </p>
      </div>

      {studyCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-16 text-center sm:py-20">
          <p className="text-lg font-medium text-foreground">
            {t("noCardsToStudy")}
          </p>
          <p className="mt-1 text-muted-foreground mb-6">{t("noCardsHint")}</p>
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
