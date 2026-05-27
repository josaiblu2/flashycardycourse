"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FREE_DECK_LIMIT } from "@/lib/billing/entitlements";

const proBenefits = [
  `Unlimited decks (free plan: ${FREE_DECK_LIMIT} decks)`,
  "AI flashcard generation from any topic",
];

type UpgradeToProButtonProps = Pick<
  React.ComponentProps<typeof Button>,
  "size" | "variant"
>;

export function UpgradeToProButton({
  size,
  variant = "outline",
}: UpgradeToProButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button
          variant={variant}
          size={size}
          nativeButton={false}
          render={<Link href="/pricing" />}
        >
          Upgrade to Pro
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="end"
        className="flex max-w-64 flex-col items-start gap-1.5 px-3 py-2 text-left"
      >
        <p className="font-medium">Pro includes</p>
        <ul className="space-y-1 text-background/90">
          {proBenefits.map((benefit) => (
            <li key={benefit} className="flex gap-1.5">
              <span aria-hidden="true">•</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
