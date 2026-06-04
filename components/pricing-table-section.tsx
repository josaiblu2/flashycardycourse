"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";

const PricingTable = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.PricingTable),
  {
    ssr: false,
    loading: () => <PricingTableLoading />,
  },
);

function PricingTableLoading() {
  const t = useTranslations("common");

  return (
    <Card>
      <CardContent className="py-12 text-center text-sm text-muted-foreground">
        {t("loadingPlans")}
      </CardContent>
    </Card>
  );
}

export function PricingTableSection() {
  return (
    <PricingTable
      fallback={<PricingTableLoading />}
      newSubscriptionRedirectUrl="/dashboard"
    />
  );
}
