import { cn } from "@/lib/utils";

interface LinkRouteProps {
  className?: string;
}

/**
 * One long, winding path that resolves into a straight line and a single dot.
 * The product's shortening idea, drawn rather than illustrated.
 */
export function LinkRoute({ className }: LinkRouteProps) {
  return (
    <svg
      viewBox="0 0 560 120"
      fill="none"
      aria-hidden="true"
      className={cn("w-full", className)}
    >
      <path
        d="M2 96C48 96 48 24 104 24C160 24 160 96 216 96C272 96 272 38 328 38C384 38 384 80 440 80H522"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {[
        [2, 96],
        [104, 24],
        [216, 96],
        [328, 38],
        [440, 80],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" className="fill-current" />
      ))}
      <circle cx="534" cy="80" r="5" className="fill-signal" />
    </svg>
  );
}
