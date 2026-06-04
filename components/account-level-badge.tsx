"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

interface AccountLevelBadgeProps {
  isClerkPro?: boolean;
  isDemoPro?: boolean;
}

export function AccountLevelBadge({
  isClerkPro = false,
  isDemoPro = false,
}: AccountLevelBadgeProps) {
  const t = useTranslations("common");

  if (isClerkPro) {
    return <Badge variant="default">{t("pro")}</Badge>;
  }

  if (isDemoPro) {
    return <Badge variant="default">{t("proDemo")}</Badge>;
  }

  return <Badge variant="secondary">{t("free")}</Badge>;
}
