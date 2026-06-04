"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("pricing");
  const tc = useTranslations("common");
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
        setError(t("activateFailed"));
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
          <AlertTitle>{t("demoProActiveTitle")}</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{t("demoProActiveDescription")}</p>
            <Button nativeButton={false} render={<Link href="/dashboard" />}>
              {tc("goToDashboard")}
            </Button>
          </AlertDescription>
        </Alert>
        {!isOnWaitlist && (
          <Card>
            <CardHeader>
              <CardTitle>{t("waitlistInterestTitle")}</CardTitle>
              <CardDescription>{t("waitlistInterestDescription")}</CardDescription>
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
          <CardTitle>{t("activateTitle")}</CardTitle>
          <CardDescription>{t("activateSignInDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button nativeButton={false} render={<Link href="/" />}>
            {t("signInToActivate")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("activateTitle")}</CardTitle>
          <CardDescription>{t("activateDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleActivate}
            disabled={isPending}
            data-icon="inline-start"
          >
            <Sparkles />
            {isPending ? t("activating") : t("activateButton")}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Dialog open={waitlistDialogOpen} onOpenChange={handleWaitlistDialogOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[min(90vh,720px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("activatedTitle")}</DialogTitle>
            <DialogDescription>{t("activatedDescription")}</DialogDescription>
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
              {t("skipForNow")}
            </Button>
            <Button
              type="button"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              {tc("goToDashboard")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
