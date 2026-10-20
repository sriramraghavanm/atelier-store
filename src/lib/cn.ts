type ClassValue = string | false | null | undefined;

/**
 * Joins class names, dropping falsy values. Variants in this design system are
 * resolved through lookup maps rather than merged strings, so no
 * conflict-resolution pass (tailwind-merge) is needed.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
