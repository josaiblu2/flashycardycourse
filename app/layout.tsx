import type { Metadata } from "next";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { HeaderAuth } from "@/components/header-auth";
import { LanguageSelector } from "@/components/language-selector";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCachedProAccess } from "@/lib/auth/cached-auth";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  fallback: [],
  adjustFontFallback: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, messages, t, proAccess] = await Promise.all([
    getLocale(),
    getMessages(),
    getTranslations("common"),
    getCachedProAccess(),
  ]);

  const clerkLocalization =
    locale === "es"
      ? (await import("@clerk/localizations/es-ES")).esES
      : (await import("@clerk/localizations/en-US")).enUS;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`dark ${poppins.variable} ${poppins.className} h-full font-sans antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans"
      >
        <ClerkProvider
          appearance={{ theme: dark }}
          localization={clerkLocalization}
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <TooltipProvider>
              <header className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
                <Link
                  href="/"
                  className="min-w-0 truncate text-base font-bold text-card-foreground transition-colors hover:text-foreground sm:text-lg"
                >
                  {t("appName")}
                </Link>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <LanguageSelector />
                  <HeaderAuth
                    isClerkPro={proAccess.isClerkPro}
                    isDemoPro={proAccess.isDemoPro}
                  />
                </div>
              </header>
              {children}
            </TooltipProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
