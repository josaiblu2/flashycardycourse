import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { DemoPricingBanner } from "@/components/demo-pricing-banner";
import { DemoProActivationSection } from "@/components/demo-pro-activation-section";
import { PricingPlansOverview } from "@/components/pricing-plans-overview";
import { PricingTableSection } from "@/components/pricing-table-section";
import { isBillingEnabled } from "@/lib/billing/config";
import { resolveProAccess } from "@/lib/billing/pro-access";
import { isUserOnWaitlist } from "@/lib/waitlist/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing | Flashy Cardy Course",
  description: "Choose the plan that fits your flashcard learning goals.",
};

export default async function PricingPage() {
  const billingEnabled = isBillingEnabled();
  const { userId, has } = await auth();
  const proAccess = userId
    ? await resolveProAccess(userId, has)
    : {
        hasPro: false,
        isClerkPro: false,
        isDemoPro: false,
        isAdmin: false,
        source: "free" as const,
      };
  const isOnWaitlist = userId ? await isUserOnWaitlist(userId) : false;

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-3xl mx-auto w-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Pricing
        </h1>
        <p className="text-muted-foreground mt-1">
          {billingEnabled
            ? "Upgrade to Pro for unlimited decks, and AI generation."
            : "Compare plans and activate free Demo Pro — no charges during the public demo."}
        </p>
      </div>

      {billingEnabled ? (
        <>
          <PricingTableSection />
          <PricingPlansOverview className="mt-10" />
        </>
      ) : (
        <div className="space-y-10">
          <DemoPricingBanner />
          <PricingPlansOverview />
          <DemoProActivationSection
            isSignedIn={!!userId}
            hasDemoPro={proAccess.isDemoPro || proAccess.isAdmin}
            isOnWaitlist={isOnWaitlist}
          />
        </div>
      )}
    </main>
  );
}
