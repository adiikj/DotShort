import { cn } from "@/lib/utils";

interface GlyphProps {
  className?: string;
}

const base = "h-5 w-5";

export function CodeGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn(base, className)}>
      <path d="M5 7 2 12l3 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 7l3 5-3 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 5 10 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="5" r="1.9" className="fill-signal" />
    </svg>
  );
}

export function QrGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn(base, className)}>
      <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="15" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 15h2v2h-2zM19 15h2v6h-2zM15 19h2v2h-2z" fill="currentColor" />
      <circle cx="20" cy="20" r="1.9" className="fill-signal" />
    </svg>
  );
}

export function LockGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn(base, className)}>
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="15" r="1.6" className="fill-signal" />
    </svg>
  );
}

export function TimerGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn(base, className)}>
      <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 13V9l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="4" r="1.9" className="fill-signal" />
    </svg>
  );
}

export function ChartGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn(base, className)}>
      <path d="M3 19h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="m4 16 4-4 3 2 5-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="8" r="2" className="fill-signal" />
    </svg>
  );
}
