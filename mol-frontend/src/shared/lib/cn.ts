type ClassValue = string | false | null | undefined

/** Merge class names; filters falsy values. */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ')
}
