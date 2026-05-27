"use client";

import { Show } from "@clerk/nextjs";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { UpgradeToProButton } from "@/components/upgrade-to-pro-button";
import { Button } from "@/components/ui/button";

interface CreateDeckActionProps {
  atDeckLimit: boolean;
  triggerLabel?: string;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
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
