"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { AccountLevelBadge } from "@/components/account-level-badge";
import { AuthButtons } from "@/components/auth-buttons";
import { Button } from "@/components/ui/button";

interface HeaderAuthProps {
  isClerkPro: boolean;
  isDemoPro: boolean;
}

export function HeaderAuth({ isClerkPro, isDemoPro }: HeaderAuthProps) {
  const t = useTranslations("common");

  return (
    <>
      <Show when="signed-out">
        <Button variant="ghost" nativeButton={false} render={<Link href="/pricing" />}>
          {t("pricing")}
        </Button>
        <AuthButtons />
      </Show>
      <Show when="signed-in">
        <div className="flex items-center gap-3">
          <AccountLevelBadge isClerkPro={isClerkPro} isDemoPro={isDemoPro} />
          <UserButton />
        </div>
      </Show>
    </>
  );
}
