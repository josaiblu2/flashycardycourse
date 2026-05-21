"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
    <>
      <SignInButton mode="modal">
        <Button size="lg" variant="outline">
          Sign In
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="lg">
          Sign Up
        </Button>
      </SignUpButton>
    </>
  );
}
