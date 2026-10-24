import { cn } from "@/lib/utils";

const PORTFOLIO_URL = "https://adiikj.dev";

export function BuiltBy({ className }: { className?: string }) {
  return (
    <a
      href={PORTFOLIO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "font-medium text-foreground underline-offset-4 transition-colors hover:underline",
        className
      )}
    >
      Built by Aditya
    </a>
  );
}
