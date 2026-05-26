import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { AuthButtons } from "@/components/auth-buttons";
import { AccountLevelBadge } from "@/components/account-level-badge";
import { TooltipProvider } from "@/components/ui/tooltip";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${poppins.variable} ${poppins.className} h-full font-sans antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ClerkProvider appearance={{ theme: dark }}>
          <TooltipProvider>
            <header className="flex items-center justify-between gap-4 bg-card border-b border-border px-6 py-4">
              <span className="text-lg font-bold text-card-foreground">
                Flashy Cardy Course
              </span>
              <div className="flex items-center gap-3">
                <Show when="signed-out">
                  <AuthButtons />
                </Show>
                <Show when="signed-in">
                  <div className="flex items-center gap-3">
                    <AccountLevelBadge />
                    <UserButton />
                  </div>
                </Show>
              </div>
            </header>
            {children}
          </TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
