import { cn } from "@/lib/utils";

/** Crop marks for the QR result. */
export function ScanCorners({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    >
      <path
        d="M3 22V3h19M78 3h19v19M97 78v19H78M22 97H3V78"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
