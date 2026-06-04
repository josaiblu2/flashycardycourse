import { Info } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export async function DemoPricingBanner() {
  const t = await getTranslations("pricing");

  return (
    <Alert>
      <Info />
      <AlertTitle>{t("demoBannerTitle")}</AlertTitle>
      <AlertDescription>{t("demoBannerDescription")}</AlertDescription>
    </Alert>
  );
}
