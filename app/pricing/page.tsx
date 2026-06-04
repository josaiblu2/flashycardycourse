import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DemoPricingBanner } from "@/components/demo-pricing-banner";
import { DemoProActivationSection } from "@/components/demo-pro-activation-section";
import { PricingPlansOverview } from "@/components/pricing-plans-overview";
import { PricingTableSection } from "@/components/pricing-table-section";
import { isBillingEnabled } from "@/lib/billing/config";
import { getCachedAuth, getCachedProAccess } from "@/lib/auth/cached-auth";
import { isUserOnWaitlist } from "@/lib/waitlist/status";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: t("pricingTitle"),
    description: t("pricingDescription"),
  };
}

export default async function PricingPage() {
  const t = await getTranslations("pricing");
  const billingEnabled = isBillingEnabled();
  const { userId } = await getCachedAuth();
  const [proAccess, isOnWaitlist] = await Promise.all([
    getCachedProAccess(),
    userId ? isUserOnWaitlist(userId) : Promise.resolve(false),
  ]);

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-3xl mx-auto w-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {billingEnabled ? t("subtitleBilling") : t("subtitleDemo")}
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
