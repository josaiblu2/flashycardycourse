"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Show } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateDeck } from "@/app/actions/decks";
import { generateCardsWithAI } from "@/app/actions/generate-cards";
import { getGenerateCardsWithAIDisabledState } from "@/lib/ai/generate-cards-button-state";

interface GenerateCardsWithAIButtonProps {
  deckId: number;
  deckName: string;
  deckDescription?: string | null;
}

interface DisabledButtonTooltipProps {
  tooltipMessage: string;
  onWrapperClick?: () => void;
  children: React.ReactNode;
}

function DisabledButtonTooltip({
  tooltipMessage,
  onWrapperClick,
  children,
}: DisabledButtonTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={
              onWrapperClick
                ? "inline-flex cursor-pointer"
                : "inline-flex cursor-not-allowed"
            }
            onClick={onWrapperClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{tooltipMessage}</TooltipContent>
    </Tooltip>
  );
}

function GenerateCardsWithAIProButton({
  deckId,
  deckName,
  deckDescription,
}: GenerateCardsWithAIButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [name, setName] = useState(deckName);
  const [description, setDescription] = useState(deckDescription ?? "");
  const [isPending, startTransition] = useTransition();

  const { disabled, reason, tooltipMessage } = getGenerateCardsWithAIDisabledState({
    isPending,
    deckName,
    deckDescription,
  });

  function runGeneration() {
    setError(null);

    startTransition(async () => {
      try {
        await generateCardsWithAI({ deckId });
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to generate cards. Please try again.";
        setError(message);
      }
    });
  }

  function handleGenerateClick() {
    if (disabled) return;
    setError(null);
    runGeneration();
  }

  function openDetailsDialog() {
    setName(deckName);
    setDescription(deckDescription ?? "");
    setError(null);
    setDetailsOpen(true);
  }

  function handleDetailsOpenChange(next: boolean) {
    if (!next) {
      setName(deckName);
      setDescription(deckDescription ?? "");
      setError(null);
    }
    setDetailsOpen(next);
  }

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Deck title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Deck description is required for AI generation.");
      return;
    }

    startTransition(async () => {
      try {
        await updateDeck({
          deckId,
          name: name.trim(),
          description: description.trim(),
        });
        setDetailsOpen(false);
        await generateCardsWithAI({ deckId });
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to save deck details or generate cards. Please try again.";
        setError(message);
      }
    });
  }

  const generateButton = (
    <Button
      variant="outline"
      onClick={handleGenerateClick}
      disabled={disabled}
      data-icon="inline-start"
    >
      <Sparkles />
      {isPending ? "Generating…" : "Generate cards with AI"}
    </Button>
  );

  const wrappedGenerateButton =
    disabled && tooltipMessage ? (
      <DisabledButtonTooltip
        tooltipMessage={tooltipMessage}
        onWrapperClick={
          reason === "missing-both" ||
          reason === "missing-title" ||
          reason === "missing-description"
            ? openDetailsDialog
            : undefined
        }
      >
        {generateButton}
      </DisabledButtonTooltip>
    ) : (
      generateButton
    );

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        {wrappedGenerateButton}
        {error && !detailsOpen && (
          <p className="text-sm text-destructive text-right max-w-xs">{error}</p>
        )}
      </div>

      <Dialog open={detailsOpen} onOpenChange={handleDetailsOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete deck details</DialogTitle>
            <DialogDescription>
              AI uses your deck title and description to create relevant
              flashcards. Fill in both fields for better results before
              generating.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDetailsSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ai-deck-name">Title</Label>
              <Input
                id="ai-deck-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Spanish vocabulary — travel phrases"
                disabled={isPending}
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-deck-description">Description</Label>
              <Textarea
                id="ai-deck-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the topic, level, and what you want to learn"
                disabled={isPending}
                rows={3}
                maxLength={500}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleDetailsOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              {isPending ? (
                <DisabledButtonTooltip tooltipMessage="Generating flashcards. Please wait…">
                  <Button type="submit" disabled data-icon="inline-start">
                    <Sparkles />
                    Saving & generating…
                  </Button>
                </DisabledButtonTooltip>
              ) : (
                <Button type="submit" data-icon="inline-start">
                  <Sparkles />
                  Save & generate cards
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function GenerateCardsWithAIFreeButton() {
  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            data-icon="inline-start"
            onClick={() => router.push("/pricing")}
          />
        }
      >
        <Sparkles />
        Generate cards with AI
      </TooltipTrigger>
      <TooltipContent>
        AI flashcard generation is a Pro feature. Click to view pricing plans.
      </TooltipContent>
    </Tooltip>
  );
}

export function GenerateCardsWithAIButton({
  deckId,
  deckName,
  deckDescription,
}: GenerateCardsWithAIButtonProps) {
  return (
    <Show
      when={{ feature: "ai_flashcard_generation" }}
      fallback={<GenerateCardsWithAIFreeButton />}
    >
      <GenerateCardsWithAIProButton
        deckId={deckId}
        deckName={deckName}
        deckDescription={deckDescription}
      />
    </Show>
  );
}
