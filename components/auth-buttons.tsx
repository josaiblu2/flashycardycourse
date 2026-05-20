"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
    <>
      <SignInButton mode="modal">
        <Button
          size="lg"
          className="h-10 border-0 bg-blue-500 px-5 text-white hover:bg-blue-600"
        >
          Sign In
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button
          size="lg"
          className="h-10 border-0 bg-green-600 px-5 text-white hover:bg-green-700"
        >
          Sign Up
        </Button>
      </SignUpButton>
    </>
  );
}
