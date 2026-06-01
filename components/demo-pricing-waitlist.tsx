"use client";

import { AuthButtons } from "@/components/auth-buttons";
import { ProWaitlistForm } from "@/components/pro-waitlist-form";
import { WaitlistJoinedMessage } from "@/components/waitlist-joined-message";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DemoPricingWaitlistProps {
  isSignedIn: boolean;
  isOnWaitlist: boolean;
}

export function DemoPricingWaitlist({
  isSignedIn,
  isOnWaitlist,
}: DemoPricingWaitlistProps) {
  if (isOnWaitlist) {
    return <WaitlistJoinedMessage />;
  }

  if (!isSignedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join the Pro waitlist</CardTitle>
          <CardDescription>
            Sign in to save your spot and tell us what Pro would be worth to
            you. No payment required during the demo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <AuthButtons />
        </CardContent>
      </Card>
    );
  }

  return <ProWaitlistForm limitType="pricing_page" />;
}
