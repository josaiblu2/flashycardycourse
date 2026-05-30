"use client";

import { useEffect, useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { joinProWaitlist } from "@/app/actions/waitlist";
import { WaitlistJoinedMessage } from "@/components/waitlist-joined-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WAITLIST_PRIVACY_NOTICE } from "@/lib/waitlist/privacy";
import {
  WAITLIST_INTEREST_CATEGORIES,
  WAITLIST_INTEREST_CATEGORY_LABELS,
  WAITLIST_PRICE_EXPECTATIONS,
  WAITLIST_PRICE_EXPECTATION_LABELS,
  type WaitlistInterestCategory,
  type WaitlistLimitType,
  type WaitlistPriceExpectation,
} from "@/lib/waitlist/schemas";

interface ProWaitlistFormProps {
  limitType: WaitlistLimitType;
  className?: string;
  onJoined?: () => void;
}

export function ProWaitlistForm({
  limitType,
  className,
  onJoined,
}: ProWaitlistFormProps) {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [interestCategory, setInterestCategory] = useState<
    WaitlistInterestCategory | undefined
  >(undefined);
  const [priceExpectation, setPriceExpectation] = useState<
    WaitlistPriceExpectation | undefined
  >(undefined);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const verifiedEmail = user?.primaryEmailAddress?.emailAddress ?? null;

  useEffect(() => {
    if (!user) return;

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    if (fullName) {
      setName((current) => current || fullName);
    }
  }, [user]);

  function handleSubmit() {
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!verifiedEmail) {
      setError(
        "Your account does not have a verified email address. Add one in your account settings and try again."
      );
      return;
    }
    if (!priceExpectation) {
      setError("Please select how much you would pay per month.");
      return;
    }
    if (!privacyAcknowledged) {
      setError("You must accept the privacy notice to join the waitlist.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await joinProWaitlist({
          name: name.trim(),
          interestCategory,
          priceExpectation,
          limitType,
          privacyAcknowledged: true,
        });

        if (result.success) {
          setSubmitted(true);
          onJoined?.();
          return;
        }

        setError(result.message);
      } catch {
        setError("Failed to join the waitlist. Please try again.");
      }
    });
  }

  if (submitted) {
    return <WaitlistJoinedMessage className={className} />;
  }

  return (
    <Alert className={className}>
      <AlertTitle>Join the Pro waitlist</AlertTitle>
      <AlertDescription>
        <p className="mb-4">
          Get notified when expanded AI access becomes available.
        </p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="waitlist-name">Name</Label>
            <Input
              id="waitlist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={isPending}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="waitlist-email">Email address</Label>
            <Input
              id="waitlist-email"
              type="email"
              value={verifiedEmail ?? ""}
              readOnly
              disabled
              aria-describedby="waitlist-email-help"
            />
            <p id="waitlist-email-help" className="text-xs text-muted-foreground">
              We use the verified email from your account. It cannot be changed
              here.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="waitlist-interest">Interest category (optional)</Label>
            <Select
              value={interestCategory ?? ""}
              onValueChange={(value) =>
                setInterestCategory(
                  value ? (value as WaitlistInterestCategory) : undefined
                )
              }
              disabled={isPending}
            >
              <SelectTrigger id="waitlist-interest" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {WAITLIST_INTEREST_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {WAITLIST_INTEREST_CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="waitlist-price">
              How much would you pay per month for Pro?
            </Label>
            <Select
              value={priceExpectation ?? null}
              onValueChange={(value) =>
                setPriceExpectation(value as WaitlistPriceExpectation)
              }
              disabled={isPending}
            >
              <SelectTrigger
                id="waitlist-price"
                className="w-full"
                aria-required
                aria-invalid={!!error && !priceExpectation}
              >
                <SelectValue placeholder="Select a price range" />
              </SelectTrigger>
              <SelectContent>
                {WAITLIST_PRICE_EXPECTATIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {WAITLIST_PRICE_EXPECTATION_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start gap-3 rounded-md border border-border p-3">
            <Checkbox
              id="waitlist-privacy"
              checked={privacyAcknowledged}
              onCheckedChange={(checked) =>
                setPrivacyAcknowledged(checked === true)
              }
              disabled={isPending}
              aria-describedby="waitlist-privacy-text"
            />
            <div className="space-y-1">
              <Label
                htmlFor="waitlist-privacy"
                className="text-sm font-normal leading-snug"
              >
                I acknowledge the privacy notice
              </Label>
              <p
                id="waitlist-privacy-text"
                className="text-xs text-muted-foreground leading-relaxed"
              >
                {WAITLIST_PRIVACY_NOTICE}
              </p>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !verifiedEmail}
            className="w-full"
          >
            {isPending ? "Joining…" : "Join waitlist"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
