import Link from "next/link";
import { cn } from "@/lib/utils";
import { RouteMark } from "@/components/brand/route-mark";

interface LogoProps {
  href?: string;
  className?: string;
}

/** Route mark + wordmark. The route terminates in the signal dot. */
export function Logo({ href = "/", className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-[19px] font-semibold leading-none tracking-[-0.055em]",
        className
      )}
    >
      <RouteMark className="h-5 w-5 text-primary" />
      <span>dotshort</span>
    </Link>
  );
}
