"use client";

import { useTransition } from "react";
import { dismissDemoProWaitlistReminder } from "@/app/actions/demo-pro";
import { ProWaitlistForm } from "@/components/pro-waitlist-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function DemoProWaitlistReminder() {
  const [isPending, startTransition] = useTransition();

  function handleDismiss() {
    startTransition(async () => {
      await dismissDemoProWaitlistReminder();
    });
  }

  return (
    <Alert className="mb-6">
      <AlertTitle>Enjoying Demo Pro?</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>
          You&apos;ve been using free Demo Pro for a week. If you&apos;re interested
          in the full paid Pro version when it launches, join the waitlist — it&apos;s
          optional and won&apos;t affect your Demo Pro access.
        </p>
        <ProWaitlistForm limitType="demo_pro_reminder" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          disabled={isPending}
        >
          {isPending ? "Dismissing…" : "Dismiss"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
