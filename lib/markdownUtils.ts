/**
 * Pure slugifier that normalizes a heading text into a URL-friendly base ID.
 * This function is deterministic and has no side effects.
 */
export function generateHeadingId(text: string): string {
  if (!text) return '';

  return String(text)
    // Remove common markdown formatting
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/_{2,}/g, '')
    .replace(/_/g, '')
    // Lowercase
    .toLowerCase()
    // Replace special characters with readable words
    .replace(/[&]/g, ' and ')
    .replace(/[+]/g, ' plus ')
    .replace(/[%]/g, ' percent ')
    .replace(/[@]/g, ' at ')
    .replace(/[#]/g, ' hash ')
    // Strip remaining non-word characters (keep letters, numbers, spaces, hyphens)
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    // Collapse spaces/hyphens to a single hyphen
    .replace(/[\s-]+/g, '-')
    // Trim hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, 50)
    // Remove trailing hyphens again if cut mid-run
    .replace(/-+$/, '');
}

/**
 * Returns a generator function that ensures unique IDs per document render.
 * The returned function appends an incrementing suffix for duplicate base IDs
 * (e.g., "intro", "intro-1", "intro-2").
 */
export function createHeadingIdGenerator() {
  const counts = new Map<string, number>();
  return (text: string): string => {
    const base = generateHeadingId(text);
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen}`;
  };
}

/**
 * Deprecated: Kept for backward compatibility; no-op in new implementation.
 */
export function resetHeadingCounter(): void {
  // no-op
}
