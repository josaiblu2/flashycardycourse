"use client";

import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";

const PricingTable = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.PricingTable),
  {
    ssr: false,
    loading: () => <PricingTableLoading />,
  },
);

function PricingTableLoading() {
  return (
    <Card>
      <CardContent className="py-12 text-center text-sm text-muted-foreground">
        Loading plans…
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
