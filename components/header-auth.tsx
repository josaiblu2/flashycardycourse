"use client";

import { Show, UserButton } from "@clerk/nextjs";
import { AccountLevelBadge } from "@/components/account-level-badge";
import { AuthButtons } from "@/components/auth-buttons";

export function HeaderAuth() {
  return (
    <>
      <Show when="signed-out">
        <AuthButtons />
      </Show>
      <Show when="signed-in">
        <div className="flex items-center gap-3">
          <AccountLevelBadge />
          <UserButton />
        </div>
      </Show>
    </>
  );
}
