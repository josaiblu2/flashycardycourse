"use client";

import Link from "next/link";
import { ActivateDemoProButton } from "@/components/activate-demo-pro-button";
import { UpgradeToProButton } from "@/components/upgrade-to-pro-button";
import { Button } from "@/components/ui/button";

type ProUpgradeActionProps = Pick<
  React.ComponentProps<typeof UpgradeToProButton>,
  "size" | "variant"
> & {
  billingEnabled: boolean;
  hasDemoPro?: boolean;
  isClerkPro?: boolean;
};

export function ProUpgradeAction({
  billingEnabled,
  size,
  variant,
  hasDemoPro = false,
  isClerkPro = false,
}: ProUpgradeActionProps) {
  if (isClerkPro || hasDemoPro) {
    return null;
  }

  if (billingEnabled) {
    return <UpgradeToProButton size={size} variant={variant} />;
  }

  return <ActivateDemoProButton size={size} variant={variant} />;
}

type ProUpgradeLinkProps = Pick<
  React.ComponentProps<typeof Button>,
  "size" | "variant"
> & {
  billingEnabled: boolean;
  hasDemoPro?: boolean;
  isClerkPro?: boolean;
  demoLabel?: string;
  billingLabel?: string;
};

export function ProUpgradeLink({
  billingEnabled,
  size,
  variant = "outline",
  hasDemoPro = false,
  isClerkPro = false,
  demoLabel = "Activate Demo Pro",
  billingLabel = "Upgrade to Pro",
}: ProUpgradeLinkProps) {
  if (isClerkPro || hasDemoPro) {
    return null;
  }

  if (billingEnabled) {
    return (
      <Button
        variant={variant}
        size={size}
        nativeButton={false}
        render={<Link href="/pricing" />}
      >
        {billingLabel}
      </Button>
    );
  }

  return (
    <ActivateDemoProButton size={size} variant={variant} label={demoLabel} />
  );
}
