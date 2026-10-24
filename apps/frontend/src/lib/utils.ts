/** Merge class names: small dependency-free stand-in for clsx+tailwind-merge. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
