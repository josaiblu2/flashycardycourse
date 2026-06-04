"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type StudyCard = {
  id: number;
  front: string;
  back: string;
};

interface StudyFlashcardsProps {
  deckId: number;
  deckName: string;
  cards: StudyCard[];
}

function shuffleCards(cards: StudyCard[]) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function StudyFlashcards({
  deckId,
  deckName,
  cards,
}: StudyFlashcardsProps) {
  const t = useTranslations("study");
  const [order, setOrder] = useState(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = order[currentIndex];
  const total = order.length;

  const progressLabel = useMemo(
    () => `${currentIndex + 1} / ${total}`,
    [currentIndex, total]
  );

  const resetSession = useCallback(
    (nextOrder: StudyCard[] = cards) => {
      setOrder(nextOrder);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsComplete(false);
    },
    [cards]
  );

  const goToPrevious = useCallback(() => {
    if (currentIndex === 0) return;
    setCurrentIndex((index) => index - 1);
    setIsFlipped(false);
    setIsComplete(false);
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex >= total - 1) {
      setIsComplete(true);
      return;
    }
    setCurrentIndex((index) => index + 1);
    setIsFlipped(false);
  }, [currentIndex, total]);

  const handleShuffle = useCallback(() => {
    resetSession(shuffleCards(cards));
  }, [cards, resetSession]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isComplete) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const isFlipKey =
        event.code === "Space" || event.key === " " || event.key === "Enter";
      const isInsideStudyCard =
        target instanceof HTMLElement &&
        target.closest("[data-study-card]") !== null;

      if (isFlipKey) {
        if (isInsideStudyCard) return;

        event.preventDefault();
        setIsFlipped((flipped) => !flipped);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, isComplete]);

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-16 text-center sm:py-20">
        <p className="text-xl font-semibold text-foreground sm:text-2xl">
          {t("sessionComplete")}
        </p>
        <p className="mt-2 mb-8 max-w-md text-muted-foreground">
          {t("sessionCompleteDescription", { total, deckName })}
        </p>
        <div className="flex w-full max-w-sm flex-col gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
          <Button className="w-full sm:w-auto" onClick={() => resetSession()}>
            {t("studyAgain")}
          </Button>
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={handleShuffle}
          >
            <Shuffle data-icon="inline-start" />
            {t("shuffleRestart")}
          </Button>
          <Link
            href={`/deck/${deckId}`}
            className={cn(buttonVariants({ variant: "ghost" }), "w-full sm:w-auto")}
          >
            {t("backToDeck")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
      <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center justify-between gap-3 sm:contents">
          <p className="shrink-0 text-sm font-medium text-muted-foreground">
            {t("cardProgress", { progress: progressLabel })}
          </p>
          <Button
            className="shrink-0 sm:order-last"
            variant="outline"
            size="sm"
            onClick={handleShuffle}
            aria-label={t("shuffleCardsAria")}
          >
            <Shuffle className="size-4 sm:mr-0" data-icon="inline-start" />
            <span className="hidden sm:inline">{t("shuffle")}</span>
          </Button>
        </div>
        <Progress
          className="w-full gap-0 sm:flex-1"
          value={Math.round(((currentIndex + 1) / total) * 100)}
        />
      </div>

      <Card
        data-study-card
        className="min-h-[min(50vh,20rem)] w-full max-w-2xl cursor-pointer touch-manipulation transition-colors active:ring-primary/40 hover:ring-primary/30 sm:min-h-72"
        onClick={() => setIsFlipped((flipped) => !flipped)}
        tabIndex={0}
        role="button"
        aria-label={isFlipped ? t("showFrontAria") : t("showBackAria")}
      >
        <CardContent className="flex min-h-[min(50vh,20rem)] flex-col items-center justify-center px-4 py-10 text-center sm:min-h-72 sm:px-8 sm:py-12">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {isFlipped ? t("back") : t("front")}
          </p>
          <p className="text-lg font-medium leading-relaxed text-foreground break-words whitespace-pre-wrap sm:text-xl">
            {isFlipped ? currentCard.back : currentCard.front}
          </p>
          <p className="mt-6 text-sm text-muted-foreground sm:mt-8">
            <span className="sm:hidden">
              {isFlipped ? t("tapShowFront") : t("tapRevealAnswer")}
            </span>
            <span className="hidden sm:inline">
              {isFlipped ? t("clickShowFront") : t("clickRevealAnswer")}
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="grid w-full max-w-2xl grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex sm:justify-between sm:gap-4">
        <Button
          className="min-h-11"
          variant="outline"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          aria-label={t("previousAria")}
        >
          <ChevronLeft className="size-4 sm:mr-0" data-icon="inline-start" />
          <span className="hidden sm:inline">{t("previous")}</span>
        </Button>

        <Button
          className="min-h-11 min-w-11 px-0 sm:min-w-0 sm:px-3"
          variant="ghost"
          size="sm"
          onClick={() => resetSession()}
          aria-label={t("restartAria")}
        >
          <RotateCcw className="size-4 sm:mr-0" data-icon="inline-start" />
          <span className="hidden sm:inline">{t("restart")}</span>
        </Button>

        <Button
          className="min-h-11 justify-self-end"
          onClick={goToNext}
          aria-label={
            currentIndex >= total - 1 ? t("finishAria") : t("nextAria")
          }
        >
          <span>{currentIndex >= total - 1 ? t("finish") : t("next")}</span>
          <ChevronRight className="size-4 sm:ml-0" data-icon="inline-end" />
        </Button>
      </div>

      <p className="hidden text-xs text-muted-foreground sm:block">
        {t("keyboardHint")}
      </p>
    </div>
  );
}
