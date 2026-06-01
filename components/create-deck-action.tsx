"use client";

import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { ProUpgradeAction } from "@/components/pro-upgrade-action";
import { Button } from "@/components/ui/button";

interface CreateDeckActionProps {
  atDeckLimit: boolean;
  hasUnlimitedDecks: boolean;
  billingEnabled: boolean;
  hasDemoPro?: boolean;
  isClerkPro?: boolean;
  triggerLabel?: string;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
}

export function CreateDeckAction({
  atDeckLimit,
  hasUnlimitedDecks,
  billingEnabled,
  hasDemoPro = false,
  isClerkPro = false,
  triggerLabel,
  triggerVariant,
}: CreateDeckActionProps) {
  if (hasUnlimitedDecks) {
    return (
      <CreateDeckDialog
        triggerLabel={triggerLabel}
        triggerVariant={triggerVariant}
      />
    );
  }

  if (atDeckLimit) {
    return (
      <ProUpgradeAction
        billingEnabled={billingEnabled}
        hasDemoPro={hasDemoPro}
        isClerkPro={isClerkPro}
      />
    );
  }

  return (
    <CreateDeckDialog
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
    />
  );
}
