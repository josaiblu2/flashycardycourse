import type { Metadata } from "next";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { dark } from "@clerk/ui/themes";
import { HeaderAuth } from "@/components/header-auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { resolveProAccess } from "@/lib/billing/pro-access";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  fallback: [],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Flashy Cardy Course",
  description:
    "Master any subject with our interactive flashcard learning system.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

  return (
    <html
      lang="en"
      className={`dark ${poppins.variable} ${poppins.className} h-full font-sans antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ClerkProvider
          appearance={{ theme: dark }}
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        >
          <TooltipProvider>
            <header className="flex items-center justify-between gap-4 bg-card border-b border-border px-6 py-4">
              <Link
                href="/"
                className="text-lg font-bold text-card-foreground hover:text-foreground transition-colors"
              >
                Flashy Cardy Course
              </Link>
              <div className="flex items-center gap-3">
                <HeaderAuth
                  isClerkPro={proAccess.isClerkPro}
                  isDemoPro={proAccess.isDemoPro}
                />
              </div>
            </header>
            {children}
          </TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
