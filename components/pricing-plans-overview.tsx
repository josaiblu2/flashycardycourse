import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FREE_DECK_LIMIT } from "@/lib/billing/entitlements";
import { cn } from "@/lib/utils";

const freeFeatures = [
  `Up to ${FREE_DECK_LIMIT} decks`,
  "Create and edit flashcards manually",
  "Interactive study mode with shuffle",
];

const proFeatures = [
  "Unlimited decks",
  "AI flashcard generation from any topic",
  "Everything in Free",
];

export function PricingPlansOverview({ className }: { className?: string }) {
  return (
    <section
      aria-label="Plan comparison"
      className={cn("grid gap-6 sm:grid-cols-2", className)}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Free</CardTitle>
            <Badge variant="secondary">Current default</Badge>
          </div>
          <CardDescription>
            Start learning with manual flashcards and up to {FREE_DECK_LIMIT}{" "}
            decks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Pro</CardTitle>
            <Badge data-icon="inline-start">
              <Sparkles />
              Recommended
            </Badge>
          </div>
          <CardDescription>
            Remove deck limits and generate full flashcard sets with AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
