"use client";

import { Show } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";

export function AccountLevelBadge() {
  return (
    <Show
      when={{ plan: "pro" }}
      fallback={<Badge variant="secondary">Free</Badge>}
    >
      <Badge variant="default">Pro</Badge>
    </Show>
  );
}
