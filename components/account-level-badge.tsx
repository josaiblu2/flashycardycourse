import { auth } from "@clerk/nextjs/server";
import { Badge } from "@/components/ui/badge";

export async function AccountLevelBadge() {
  const { userId, has } = await auth();
  if (!userId) return null;

  const isPro = has({ plan: "pro" });

  return (
    <Badge variant={isPro ? "default" : "secondary"}>
      {isPro ? "Pro" : "Free"}
    </Badge>
  );
}
