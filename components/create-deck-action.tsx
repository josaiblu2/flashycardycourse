import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateDeckDialog } from "@/components/create-deck-dialog";

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
  if (atDeckLimit) {
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

  return (
    <CreateDeckDialog
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
    />
  );
}
