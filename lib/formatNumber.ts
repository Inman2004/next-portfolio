/**
 * Formats a number with k, m, b suffixes for thousands, millions, and billions
 * @param num - The number to format
 * @param decimals - Number of decimal places to show (default: 1)
 * @returns Formatted string with appropriate suffix
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(decimals).replace(/\.0+$|(\.\d*[1-9])0+$/, '$1') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals).replace(/\.0+$|(\.\d*[1-9])0+$/, '$1') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals).replace(/\.0+$|(\.\d*[1-9])0+$/, '$1') + 'K';
  }
  return num.toString();
}

/**
 * Formats a number representing likes count with k, m, b suffixes
 * @param likes - The number of likes to format
 * @returns Formatted string (e.g., "1.2k", "5.6m", "3.4b")
 */
export function formatLikes(likes: number): string {
  return formatNumber(likes);
}
