/**
 * Validates if a string is a valid URL
 * @param url The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export const isValidUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  
  try {
    // Check if it's a blob URL or data URL
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return true;
    }
    
    // Check if it's a relative URL
    if (url.startsWith('/')) {
      return true;
    }
    
    // Check if it's a valid absolute URL
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

/**
 * Gets a safe URL for the Image component
 * @param url The URL to make safe
 * @param fallback A fallback URL if the provided one is invalid
 * @returns A safe URL or the fallback
 */
export const getSafeImageUrl = (url: string | undefined | null, fallback: string = ''): string => {
  return url && isValidUrl(url) ? url : fallback;
};
