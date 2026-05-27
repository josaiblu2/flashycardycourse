"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { CreateDeckDialog } from "@/components/create-deck-dialog";

interface CreateDeckActionProps {
  atDeckLimit: boolean;
  triggerLabel?: string;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
}

function UpgradeToProButton() {
  return (
    <Button
      variant="outline"
      nativeButton={false}
      render={<Link href="/pricing" />}
    >
      Upgrade to Pro
    </Button>
  );
}

export function CreateDeckAction({
  atDeckLimit,
  triggerLabel,
  triggerVariant,
}: CreateDeckActionProps) {
  return (
    <Show
      when={{ feature: "unlimited_decks" }}
      fallback={
        atDeckLimit ? (
          <UpgradeToProButton />
        ) : (
          <CreateDeckDialog
            triggerLabel={triggerLabel}
            triggerVariant={triggerVariant}
          />
        )
      }
    >
      <CreateDeckDialog
        triggerLabel={triggerLabel}
        triggerVariant={triggerVariant}
      />
    </Show>
  );
}
