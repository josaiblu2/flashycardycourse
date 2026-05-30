import type { Metadata } from "next";
import { PricingTable } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Pricing | Flashy Cardy Course",
  description: "Choose the plan that fits your flashcard learning goals.",
};

export default function PricingPage() {
  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-3xl mx-auto w-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Pricing
        </h1>
        <p className="text-muted-foreground mt-1">
          Upgrade to Pro for unlimited decks, and AI generation.
        </p>
      </div>
      <PricingTable />
    </main>
  );
}
