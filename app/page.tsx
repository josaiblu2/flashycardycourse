import { auth } from "@clerk/nextjs/server";
import { AuthButtons } from "@/components/auth-buttons";
import { RedirectIfSignedIn } from "@/components/redirect-if-signed-in";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <RedirectIfSignedIn />
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          FlashyCard
        </h1>
        <p className="text-lg font-medium text-muted-foreground sm:text-xl">
          Your personal flashcard platform
        </p>
        {!userId && (
          <div className="mt-4 flex gap-3">
            <AuthButtons />
          </div>
        )}
      </div>
    </main>
  );
}
