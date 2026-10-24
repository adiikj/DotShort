import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

/** Consistent product-page masthead. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative flex flex-wrap items-end justify-between gap-4 border-b pb-5">
      <span
        aria-hidden="true"
        className="absolute -bottom-[3.5px] right-0 h-1.5 w-1.5 rounded-full bg-signal"
      />
      <div className="min-w-0">
        <h1 className="text-[28px] font-semibold tracking-[-0.035em] sm:text-[32px]">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
