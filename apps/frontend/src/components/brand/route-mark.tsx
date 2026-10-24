import { cn } from "@/lib/utils";

/** A link route that ends in the signal dot. Used in the logo and empty states. */
export function RouteMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
    >
      <path
        d="M3 17c5.5 0 5.5-10 11.5-10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="3" cy="17" r="1.4" className="fill-current" />
      <circle cx="18" cy="7" r="2.4" className="fill-signal" />
    </svg>
  );
}
