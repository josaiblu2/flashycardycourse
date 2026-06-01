import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DemoPricingBanner() {
  return (
    <Alert>
      <Info />
      <AlertTitle>Public demo — no charges yet</AlertTitle>
      <AlertDescription>
        FlashyCardy is running as a public demo. Pro subscriptions and payments
        are not available yet. Activate free Demo Pro below to unlock unlimited
        decks and AI generation — subject to demo usage limits.
      </AlertDescription>
    </Alert>
  );
}
