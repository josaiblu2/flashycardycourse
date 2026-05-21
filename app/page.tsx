import { Show } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthButtons } from "@/components/auth-buttons";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          FlashyCard
        </h1>
        <p className="text-lg font-medium text-muted-foreground sm:text-xl">
          Your personal flashcard platform
        </p>
        <Show when="signed-out">
          <div className="mt-4 flex gap-3">
            <AuthButtons />
          </div>
        </Show>
      </div>
    </main>
  );
}
