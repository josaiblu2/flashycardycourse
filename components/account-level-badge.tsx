import { Badge } from "@/components/ui/badge";

interface AccountLevelBadgeProps {
  isClerkPro?: boolean;
  isDemoPro?: boolean;
}

export function AccountLevelBadge({
  isClerkPro = false,
  isDemoPro = false,
}: AccountLevelBadgeProps) {
  if (isClerkPro) {
    return <Badge variant="default">Pro</Badge>;
  }

  if (isDemoPro) {
    return <Badge variant="default">Pro Demo</Badge>;
  }

  return <Badge variant="secondary">Free</Badge>;
}
