"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCard } from "@/app/actions/cards";

interface EditCardDialogProps {
  cardId: number;
  deckId: number;
  initialFront: string;
  initialBack: string;
}

export function EditCardDialog({
  cardId,
  deckId,
  initialFront,
  initialBack,
}: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setFront(initialFront);
      setBack(initialBack);
      setError(null);
    }
    setOpen(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!front.trim()) {
      setError("Front side is required.");
      return;
    }
    if (!back.trim()) {
      setError("Back side is required.");
      return;
    }

    startTransition(async () => {
      try {
        await updateCard({
          cardId,
          deckId,
          front: front.trim(),
          back: back.trim(),
        });
        setOpen(false);
      } catch {
        setError("Failed to update card. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the front and back of this flashcard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor={`card-front-${cardId}`}>Front</Label>
            <Textarea
              id={`card-front-${cardId}`}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Front side of the card"
              disabled={isPending}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`card-back-${cardId}`}>Back</Label>
            <Textarea
              id={`card-back-${cardId}`}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Back side of the card"
              disabled={isPending}
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
