import Link from "next/link";
import {
  BookOpen,
  Brain,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
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

export async function LandingPage() {
  const t = await getTranslations("landing");

  const steps = [
    {
      step: "1",
      title: t("step1Title"),
      description: t("step1Description"),
    },
    {
      step: "2",
      title: t("step2Title"),
      description: t("step2Description"),
    },
    {
      step: "3",
      title: t("step3Title"),
      description: t("step3Description"),
    },
  ];

  const coreFeatures = [
    {
      icon: Layers,
      title: t("featureOrganizeTitle"),
      description: t("featureOrganizeDescription"),
    },
    {
      icon: BookOpen,
      title: t("featureBuildTitle"),
      description: t("featureBuildDescription"),
    },
    {
      icon: Brain,
      title: t("featureStudyTitle"),
      description: t("featureStudyDescription"),
    },
  ];

  const proBenefits = [
    {
      icon: Zap,
      title: t("proUnlimitedTitle"),
      description: t("proUnlimitedDescription", { deckLimit: FREE_DECK_LIMIT }),
    },
    {
      icon: Sparkles,
      title: t("proAiTitle"),
      description: t("proAiDescription"),
    },
  ];

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center px-6 py-16 text-center sm:py-24">
        <Badge variant="secondary" className="mb-4">
          {t("badge")}
        </Badge>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {t("heroTitleBefore")}{" "}
          <span className="text-primary">{t("heroBrand")}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {t("heroDescription")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <AuthButtons />
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/pricing" />}
          >
            {t("viewProPlans")}
          </Button>
        </div>
      </section>

      <Separator />

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("howItWorksTitle")}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t("howItWorksSubtitle")}
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

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("featuresTitle")}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t("featuresSubtitle")}
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

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <Badge className="mb-3" data-icon="inline-start">
            <Sparkles />
            {t("proBadge")}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("proTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            {t("proSubtitle", { deckLimit: FREE_DECK_LIMIT })}
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
                {t("comparisonTitle")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("comparisonDescription", { deckLimit: FREE_DECK_LIMIT })}
              </p>
            </div>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/pricing" />}
              data-icon="inline-start"
            >
              <Sparkles />
              {t("seePricing")}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="border-t border-border bg-muted/30 px-6 py-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("ctaTitle")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("ctaDescription")}</p>
          <div className="mt-6">
            <AuthButtons />
          </div>
        </div>
      </section>
    </main>
  );
}
