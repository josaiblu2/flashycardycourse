import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface WaitlistJoinedMessageProps {
  className?: string;
}

export function WaitlistJoinedMessage({ className }: WaitlistJoinedMessageProps) {
  return (
    <Alert className={cn(className)}>
      <AlertTitle>Thanks for your interest!</AlertTitle>
      <AlertDescription className="whitespace-pre-line">
        {`You're on the FlashyCardy Pro waitlist.

We'll let you know when the full Pro version becomes available.`}
      </AlertDescription>
    </Alert>
  );
}
