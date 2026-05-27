import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { HeaderAuth } from "@/components/header-auth";
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
        <ClerkProvider
          appearance={{ theme: dark }}
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        >
          <TooltipProvider>
            <header className="flex items-center justify-between gap-4 bg-card border-b border-border px-6 py-4">
              <span className="text-lg font-bold text-card-foreground">
                Flashy Cardy Course
              </span>
              <div className="flex items-center gap-3">
                <HeaderAuth />
              </div>
            </header>
            {children}
          </TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
