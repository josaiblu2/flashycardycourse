import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WaitlistJoinedMessageProps {
  className?: string;
}

export function WaitlistJoinedMessage({ className }: WaitlistJoinedMessageProps) {
  return (
    <Alert className={className}>
      <AlertTitle>Thanks for your interest!</AlertTitle>
      <AlertDescription className="whitespace-pre-line">
        {`You're on the FlashyCardy Pro waitlist.

We'll let you know when expanded AI access becomes available.`}
      </AlertDescription>
    </Alert>
  );
}
