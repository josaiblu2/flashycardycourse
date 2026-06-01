"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { activateDemoPro } from "@/app/actions/demo-pro";
import { ProWaitlistForm } from "@/components/pro-waitlist-form";
import { WaitlistJoinedMessage } from "@/components/waitlist-joined-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DemoProActivationSectionProps {
  isSignedIn: boolean;
  hasDemoPro: boolean;
  isOnWaitlist: boolean;
}

export function DemoProActivationSection({
  isSignedIn,
  hasDemoPro,
  isOnWaitlist,
}: DemoProActivationSectionProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [waitlistDialogOpen, setWaitlistDialogOpen] = useState(false);
  const [showOptionalWaitlist, setShowOptionalWaitlist] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleActivate() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await activateDemoPro();
        if (!result.success) {
          setError(result.message);
          return;
        }

        const shouldPromptWaitlist = !isOnWaitlist && !result.alreadyActive;
        if (shouldPromptWaitlist) {
          setShowOptionalWaitlist(true);
          setWaitlistDialogOpen(true);
          return;
        }

        router.refresh();
      } catch {
        setError("Failed to activate Demo Pro. Please try again.");
      }
    });
  }

  function handleWaitlistDialogOpenChange(open: boolean) {
    setWaitlistDialogOpen(open);
    if (!open && showOptionalWaitlist) {
      router.refresh();
    }
  }

  function handleWaitlistJoined() {
    handleWaitlistDialogOpenChange(false);
  }

  if (hasDemoPro) {
    return (
      <div className="space-y-6">
        <Alert>
          <Sparkles />
          <AlertTitle>Demo Pro is active on your account</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>
              You have free Demo Pro access — unlimited decks and AI flashcard
              generation under demo usage limits. This is not a paid subscription.
            </p>
            <Button nativeButton={false} render={<Link href="/dashboard" />}>
              Go to dashboard
            </Button>
          </AlertDescription>
        </Alert>
        {!isOnWaitlist && (
          <Card>
            <CardHeader>
              <CardTitle>Interested in full Pro when it launches?</CardTitle>
              <CardDescription>
                Join the waitlist for free — we&apos;ll notify you when paid Pro
                becomes available. Optional and separate from your Demo Pro access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProWaitlistForm limitType="demo_pro_activation" />
            </CardContent>
          </Card>
        )}
        {isOnWaitlist && <WaitlistJoinedMessage />}
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activate Demo Pro — free</CardTitle>
          <CardDescription>
            Sign in to unlock unlimited decks and AI generation on your account.
            No payment required during the public demo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button nativeButton={false} render={<Link href="/" />}>
            Sign in to activate
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Activate Demo Pro — free</CardTitle>
          <CardDescription>
            Unlock unlimited decks and AI flashcard generation instantly. Demo Pro
            is free access for testing — not a paid subscription. AI usage remains
            subject to demo limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleActivate}
            disabled={isPending}
            data-icon="inline-start"
          >
            <Sparkles />
            {isPending ? "Activating…" : "Activate Demo Pro"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Dialog open={waitlistDialogOpen} onOpenChange={handleWaitlistDialogOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[min(90vh,720px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Demo Pro activated!</DialogTitle>
            <DialogDescription>
              Your account now has free Demo Pro access. Would you like to join
              the Pro waitlist? It&apos;s optional — you can skip and start using
              Pro features right away.
            </DialogDescription>
          </DialogHeader>
          {showOptionalWaitlist && !isOnWaitlist ? (
            <ProWaitlistForm
              limitType="demo_pro_activation"
              onJoined={handleWaitlistJoined}
            />
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleWaitlistDialogOpenChange(false)}
            >
              Skip for now
            </Button>
            <Button
              type="button"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              Go to dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
