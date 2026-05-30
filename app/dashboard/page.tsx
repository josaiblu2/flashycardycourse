import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getDecksByUser } from "@/db/queries/decks";
import {
  FREE_DECK_LIMIT,
  hasUnlimitedDecks,
  isAtDeckLimit,
} from "@/lib/billing/entitlements";
import { CreateDeckAction } from "@/components/create-deck-action";
import { UpgradeToProButton } from "@/components/upgrade-to-pro-button";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const { userId, has } = await auth();
  if (!userId) redirect("/");

  const userDecks = await getDecksByUser(userId);
  const canCreateUnlimited = hasUnlimitedDecks(has);
  const atDeckLimit = isAtDeckLimit(has, userDecks.length);

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your flashcard decks
            {!canCreateUnlimited && (
              <span>
                {" "}
                · {userDecks.length} / {FREE_DECK_LIMIT} decks
              </span>
            )}
          </p>
        </div>
        <CreateDeckAction atDeckLimit={atDeckLimit} />
      </div>

      {atDeckLimit && (
        <Alert className="mb-6">
          <Sparkles />
          <AlertTitle>Deck limit reached</AlertTitle>
          <AlertDescription>
            You&apos;ve used all {FREE_DECK_LIMIT} free decks. Upgrade to Pro to
            create unlimited decks, and generate flashcards with AI.
          </AlertDescription>
          <AlertAction>
            <UpgradeToProButton size="sm" />
          </AlertAction>
        </Alert>
      )}

      {userDecks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-medium text-foreground">No decks yet</p>
          <p className="text-muted-foreground mt-1 mb-6">
            Create your first deck to start studying
          </p>
          <CreateDeckAction atDeckLimit={atDeckLimit} triggerLabel="Create Deck" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userDecks.map((deck) => (
            <Link key={deck.id} href={`/deck/${deck.id}`} className="flex">
              <Card className="flex flex-col w-full hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="truncate">{deck.name}</CardTitle>
                  {deck.description && (
                    <CardDescription className="line-clamp-2">
                      {deck.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter className="mt-auto">
                  <p className="text-xs text-muted-foreground">
                    Updated{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(deck.updatedAt))}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
