/**
 * Calculates the estimated reading time for a given text
 * @param text The text content to analyze
 * @param wordsPerMinute Average reading speed (default: 200 words per minute)
 * @returns Object containing minutes and formatted string
 */
export function calculateReadingTime(text: string, wordsPerMinute = 200) {
  // Remove HTML tags if present
  const cleanText = text.replace(/<[^>]*>?/gm, '');
  
  // Count words (simplified - counts word boundaries)
  const wordCount = cleanText.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  // Calculate minutes (round up to nearest minute)
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  
  // Format the output (e.g., "3 min read" or "1 min read")
  const formatted = `${minutes} min${minutes === 1 ? '' : 's'} read`;
  
  return {
    minutes,
    words: wordCount,
    text: formatted,
  };
}

/**
 * Updates the reading time for a blog post
 * @param post The blog post object
 * @returns Post with updated readingTime
 */
export function updatePostReadingTime<T extends { content: string; readingTime?: string }>(
  post: T
): T & { readingTime: string } {
  return {
    ...post,
    readingTime: calculateReadingTime(post.content).text,
  };
}
