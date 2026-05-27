"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
} from "lucide-react";
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
        // Focused study card uses role="button", so Space/Enter synthesize a click.
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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <p className="text-2xl font-semibold text-foreground">
          Session complete!
        </p>
        <p className="text-muted-foreground mt-2 mb-8 max-w-md">
          You reviewed all {total} cards in {deckName}.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => resetSession()}>Study again</Button>
          <Button variant="outline" onClick={handleShuffle}>
            <Shuffle data-icon="inline-start" />
            Shuffle & restart
          </Button>
          <Link
            href={`/deck/${deckId}`}
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Back to deck
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex w-full max-w-2xl items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">
          Card {progressLabel}
        </p>
        <Progress
          className="flex-1 gap-0"
          value={Math.round(((currentIndex + 1) / total) * 100)}
        />
        <Button variant="outline" size="sm" onClick={handleShuffle}>
          <Shuffle data-icon="inline-start" />
          Shuffle
        </Button>
      </div>

      <Card
        data-study-card
        className="min-h-72 w-full max-w-2xl cursor-pointer transition-colors hover:ring-primary/30"
        onClick={() => setIsFlipped((flipped) => !flipped)}
        tabIndex={0}
        role="button"
        aria-label={isFlipped ? "Show front of card" : "Show back of card"}
      >
        <CardContent className="flex min-h-72 flex-col items-center justify-center px-8 py-12 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {isFlipped ? "Back" : "Front"}
          </p>
          <p className="text-xl font-medium leading-relaxed text-foreground whitespace-pre-wrap">
            {isFlipped ? currentCard.back : currentCard.front}
          </p>
          <p className="mt-8 text-sm text-muted-foreground">
            {isFlipped
              ? "Click or press Space to show front"
              : "Click or press Space to reveal answer"}
          </p>
        </CardContent>
      </Card>

      <div className="flex w-full max-w-2xl items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft data-icon="inline-start" />
          Previous
        </Button>

        <Button variant="ghost" size="sm" onClick={() => resetSession()}>
          <RotateCcw data-icon="inline-start" />
          Restart
        </Button>

        <Button onClick={goToNext}>
          {currentIndex >= total - 1 ? "Finish" : "Next"}
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        ← → to navigate · Space to flip
      </p>
    </div>
  );
}
