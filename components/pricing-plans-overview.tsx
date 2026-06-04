import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
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

export async function PricingPlansOverview({ className }: { className?: string }) {
  const t = await getTranslations("pricing");
  const tc = await getTranslations("common");

  const freeFeatures = [
    t("freeFeatureDecks", { deckLimit: FREE_DECK_LIMIT }),
    t("freeFeatureManual"),
    t("freeFeatureStudy"),
  ];

  const proFeatures = [
    t("proFeatureUnlimited"),
    t("proFeatureAi"),
    t("proFeatureAllFree"),
  ];

  return (
    <section
      aria-label={t("planComparisonAria")}
      className={cn("grid gap-6 sm:grid-cols-2", className)}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{t("freeTitle")}</CardTitle>
            <Badge variant="secondary">{t("freeBadge")}</Badge>
          </div>
          <CardDescription>
            {t("freeDescription", { deckLimit: FREE_DECK_LIMIT })}
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
            <CardTitle>{t("proTitle")}</CardTitle>
            <Badge data-icon="inline-start">
              <Sparkles />
              {tc("recommended")}
            </Badge>
          </div>
          <CardDescription>{t("proDescription")}</CardDescription>
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
