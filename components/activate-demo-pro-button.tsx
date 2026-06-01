"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { activateDemoPro } from "@/app/actions/demo-pro";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FREE_DECK_LIMIT } from "@/lib/billing/entitlements";

const demoProBenefits = [
  `Unlimited decks (free plan: ${FREE_DECK_LIMIT} decks)`,
  "AI flashcard generation from any topic",
  "Free Demo Pro access — no payment required",
];

type ActivateDemoProButtonProps = Pick<
  React.ComponentProps<typeof Button>,
  "size" | "variant"
> & {
  onActivated?: () => void;
  label?: string;
};

export function ActivateDemoProButton({
  size,
  variant = "default",
  onActivated,
  label = "Activate Demo Pro",
}: ActivateDemoProButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
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
        onActivated?.();
        router.refresh();
      } catch {
        setError("Failed to activate Demo Pro. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <Button
            variant={variant}
            size={size}
            onClick={handleActivate}
            disabled={isPending}
            data-icon="inline-start"
          >
            <Sparkles />
            {isPending ? "Activating…" : label}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          className="flex max-w-64 flex-col items-start gap-1.5 px-3 py-2 text-left"
        >
          <p className="font-medium">Demo Pro includes</p>
          <ul className="space-y-1 text-background/90">
            {demoProBenefits.map((benefit) => (
              <li key={benefit} className="flex gap-1.5">
                <span aria-hidden="true">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
