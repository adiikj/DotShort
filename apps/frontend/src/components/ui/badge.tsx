import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive" | "success";

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-primary/15 bg-primary/10 text-primary",
  secondary: "border-transparent bg-muted text-muted-foreground",
  outline: "border-border bg-transparent text-muted-foreground",
  destructive: "border-destructive/20 bg-destructive/10 text-destructive",
  success: "border-emerald-600/20 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
