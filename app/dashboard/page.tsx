import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { decks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userDecks = await db
    .select()
    .from(decks)
    .where(eq(decks.clerkUserId, userId));

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your flashcard decks
          </p>
        </div>
        <Button>New Deck</Button>
      </div>

      {userDecks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-medium text-foreground">No decks yet</p>
          <p className="text-muted-foreground mt-1 mb-6">
            Create your first deck to start studying
          </p>
          <Button>Create Deck</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userDecks.map((deck) => (
            <div
              key={deck.id}
              className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2 hover:border-primary/50 transition-colors"
            >
              <h2 className="font-semibold text-foreground truncate">
                {deck.name}
              </h2>
              {deck.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {deck.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-auto pt-2">
                Created{" "}
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(deck.createdAt))}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
