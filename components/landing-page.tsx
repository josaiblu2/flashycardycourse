import Link from "next/link";
import {
  BookOpen,
  Brain,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { AuthButtons } from "@/components/auth-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FREE_DECK_LIMIT } from "@/lib/billing/entitlements";

const coreFeatures = [
  {
    icon: Layers,
    title: "Organize by deck",
    description:
      "Group flashcards into decks for each subject, exam, or language so your study material stays structured and easy to find.",
  },
  {
    icon: BookOpen,
    title: "Build your cards",
    description:
      "Add questions and answers manually, edit anytime, and keep every deck tailored to exactly what you need to learn.",
  },
  {
    icon: Brain,
    title: "Study interactively",
    description:
      "Flip through cards, shuffle the deck, and track progress in a focused study session built for active recall.",
  },
];

const proBenefits = [
  {
    icon: Zap,
    title: "Unlimited decks",
    description: `Free accounts include up to ${FREE_DECK_LIMIT} decks. Pro removes the cap so you can manage every course, certification, and side project in one place.`,
  },
  {
    icon: Sparkles,
    title: "AI flashcard generation",
    description:
      "Describe a topic and let AI create a full set of flashcards for you — with language, level, and format options to match how you learn.",
  },
];

const steps = [
  {
    step: "1",
    title: "Create a deck",
    description: "Name your topic and add a short description to set the scope.",
  },
  {
    step: "2",
    title: "Add flashcards",
    description: "Write cards yourself or generate them instantly with AI on Pro.",
  },
  {
    step: "3",
    title: "Start studying",
    description: "Run through your deck with flip cards, shuffle, and progress tracking.",
  },
];

export function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center px-6 py-16 text-center sm:py-24">
        <Badge variant="secondary" className="mb-4">
          Flashcard learning, simplified
        </Badge>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Master any subject with{" "}
          <span className="text-primary">Flashy Cardy</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Flashy Cardy is your personal flashcard platform. Create decks, build
          cards, and study with active recall — whether you&apos;re prepping for
          exams, learning a language, or picking up a new skill.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <AuthButtons />
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/pricing" />}
          >
            View Pro plans
          </Button>
        </div>
      </section>

      <Separator />

      {/* How it works */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-muted-foreground">
            From blank deck to study session in three steps.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((item) => (
            <Card key={item.step} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {item.step}
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Core features */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Everything you need to learn
          </h2>
          <p className="mt-2 text-muted-foreground">
            A focused toolkit for creating and reviewing flashcards.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {coreFeatures.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="size-8 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Pro benefits */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <Badge className="mb-3" data-icon="inline-start">
            <Sparkles />
            Pro
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Go further with Pro
          </h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Start free with up to {FREE_DECK_LIMIT} decks. Upgrade when you need
            more room and AI-powered card creation.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {proBenefits.map((benefit) => (
            <Card
              key={benefit.title}
              className="border-primary/30 bg-primary/5"
            >
              <CardHeader>
                <benefit.icon className="size-8 text-primary" />
                <CardTitle>{benefit.title}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="font-semibold text-foreground">
                Free vs Pro at a glance
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Free: up to {FREE_DECK_LIMIT} decks, manual cards only. Pro:
                unlimited decks, and AI generation.
              </p>
            </div>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/pricing" />}
              data-icon="inline-start"
            >
              <Sparkles />
              See pricing
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-muted/30 px-6 py-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to start learning?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Create a free account and build your first deck in minutes.
          </p>
          <div className="mt-6">
            <AuthButtons />
          </div>
        </div>
      </section>
    </main>
  );
}
