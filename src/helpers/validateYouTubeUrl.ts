/**
 * Validates and sanitizes YouTube URLs for safe embedding
 *
 * @param url - The URL string to validate
 * @returns Object with isValid boolean and sanitized URL if valid
 */
export const validateYouTubeUrl = (url: string): { isValid: boolean; sanitizedUrl: string | null } => {
  // Check for null/undefined/non-string inputs
  if (!url || typeof url !== 'string') {
    return { isValid: false, sanitizedUrl: null };
  }

  // Remove whitespace
  const cleanUrl = url.trim();

  // Check for empty or obviously invalid inputs
  if (cleanUrl.length === 0) {
    return { isValid: false, sanitizedUrl: null };
  }

  try {
    // Parse the URL
    const parsed = new URL(cleanUrl);

    // Check if it's a valid YouTube domain
    const validDomains = [
      'www.youtube.com',
      'youtube.com',
      'm.youtube.com',
      'youtu.be',
      'www.youtube-nocookie.com', // Privacy-enhanced mode
      'youtube-nocookie.com'
    ];

    const isValidDomain = validDomains.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );

    if (!isValidDomain) {
      return { isValid: false, sanitizedUrl: null };
    }

    // Only allow https protocol
    if (parsed.protocol !== 'https:') {
      return { isValid: false, sanitizedUrl: null };
    }

    // For privacy, prefer youtube-nocookie.com for embeds
    let embedUrl = cleanUrl;
    if (parsed.hostname.includes('youtube.com') && !parsed.hostname.includes('nocookie')) {
      embedUrl = cleanUrl.replace('youtube.com', 'youtube-nocookie.com');
    }

    return { isValid: true, sanitizedUrl: embedUrl };
  } catch (error) {
    // URL parsing failed - not a valid URL
    return { isValid: false, sanitizedUrl: null };
  }
};

/**
 * Extracts a YouTube video ID from various URL formats
 *
 * @param url - YouTube URL
 * @returns Video ID if found, null otherwise
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    // youtu.be/VIDEO_ID format
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1); // Remove leading slash
    }

    // youtube.com/watch?v=VIDEO_ID format
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v');
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Creates a safe YouTube embed URL from a video ID
 *
 * @param videoId - YouTube video ID
 * @returns Safe embed URL using youtube-nocookie.com
 */
export const createSafeYouTubeEmbedUrl = (videoId: string): string => {
  // Sanitize video ID - only allow alphanumeric, dash, and underscore
  const sanitizedId = videoId.replace(/[^a-zA-Z0-9_-]/g, '');

  if (sanitizedId.length === 0) {
    throw new Error('Invalid video ID');
  }

  return `https://www.youtube-nocookie.com/embed/${sanitizedId}`;
};