/**
 * Generates a URL-friendly ID from a heading text
 * Handles markdown formatting, special characters, and ensures unique ID generation
 */
let headingCounts: Record<string, number> = {};

export function generateHeadingId(text: string): string {
  if (!text) return '';
  
  // Create base ID from the text
  let baseId = String(text)
    // First remove markdown formatting
    .replace(/`/g, '')         // Remove backticks
    .replace(/\*\*/g, '')      // Remove ** for bold
    .replace(/\*/g, '')        // Remove * for italic
    .replace(/_{2,}/g, '')     // Remove __ for bold
    .replace(/_/g, '')         // Remove _ for italic
    
    // Convert to lowercase
    .toLowerCase()
    
    // Replace common special characters with their text equivalents
    .replace(/[&]/g, ' and ')
    .replace(/[+]/g, ' plus ')
    .replace(/[%]/g, ' percent ')
    .replace(/[@]/g, ' at ')
    .replace(/[#]/g, ' hash ')
    
    // Remove all remaining special characters except letters, numbers, spaces, and hyphens
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    
    // Replace any sequence of whitespace or hyphens with a single hyphen
    .replace(/[\s-]+/g, '-')
    
    // Remove any leading or trailing hyphens
    .replace(/^-+|-+$/g, '')
    
    // Truncate to a reasonable length (50 chars) to avoid very long IDs
    .substring(0, 50)
    
    // Remove any trailing hyphen that might have been created by the substring
    .replace(/-+$/, '');

  // If this is the first time we've seen this ID, initialize the counter
  if (headingCounts[baseId] === undefined) {
    headingCounts[baseId] = 0;
    return baseId;
  }

  // Otherwise, increment the counter and append it to create a unique ID
  headingCounts[baseId]++;
  const uniqueId = `${baseId}-${headingCounts[baseId]}`;
  
  // Ensure the final ID isn't too long
  return uniqueId.substring(0, 60);
}

/**
 * Resets the heading counter, should be called before processing a new document
 */
export function resetHeadingCounter(): void {
  headingCounts = {};
}
