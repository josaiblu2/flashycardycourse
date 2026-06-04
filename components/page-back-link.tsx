import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageBackLinkProps {
  href: string;
  label: string;
  shortLabel?: string;
  className?: string;
}

export function PageBackLink({
  href,
  label,
  shortLabel,
  className,
}: PageBackLinkProps) {
  const mobileLabel = shortLabel ?? label;

  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "mb-4 -ml-1 gap-1.5 sm:-ml-2",
        className
      )}
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden />
      <span className="sm:hidden">{mobileLabel}</span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
