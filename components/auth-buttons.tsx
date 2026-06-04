"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  const t = useTranslations("common");

  return (
    <>
      <SignInButton mode="modal">
        <Button size="lg" variant="outline">
          {t("signIn")}
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="lg">{t("signUp")}</Button>
      </SignUpButton>
    </>
  );
}
