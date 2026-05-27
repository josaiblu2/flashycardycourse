"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type RedirectIfSignedInProps = {
  to?: string;
};

export function RedirectIfSignedIn({ to = "/dashboard" }: RedirectIfSignedInProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    router.refresh();
    router.replace(to);
  }, [isLoaded, isSignedIn, router, to]);

  return null;
}
