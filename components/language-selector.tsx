"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { setLocale } from "@/app/actions/locale";
import { locales, type Locale } from "@/i18n/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const NATIVE_LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

const MENU_LOCALE_ORDER: Locale[] = ["es", "en"];

export function LanguageSelector() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const triggerLabel =
    locale === "es" ? NATIVE_LANGUAGE_NAMES.es : t("language");

  function handleChange(nextLocale: Locale) {
    if (nextLocale === locale) return;

    startTransition(async () => {
      await setLocale(nextLocale);
      router.refresh();
    });
  }

  return (
    <Select
      value={locale}
      onValueChange={(value) => handleChange(value as Locale)}
      disabled={isPending}
    >
      <SelectTrigger
        className="h-9 w-auto min-w-[6.75rem] max-w-[9.5rem] gap-1.5 px-2.5 sm:min-w-[7.25rem]"
        aria-label={`${t("language")}: ${NATIVE_LANGUAGE_NAMES[locale]}`}
      >
        <Languages
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <span className="truncate">{triggerLabel}</span>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[9rem]">
        {MENU_LOCALE_ORDER.filter((option) => locales.includes(option)).map(
          (option) => (
            <SelectItem key={option} value={option}>
              {NATIVE_LANGUAGE_NAMES[option]}
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  );
}
