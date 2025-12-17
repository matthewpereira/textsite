/**
 * Validates URLs extracted from markdown links for security
 * Prevents XSS and other injection attacks
 *
 * @param url - The URL to validate
 * @returns true if URL is safe to use in href, false otherwise
 */
export const validateMarkdownUrl = (url: string): boolean => {
  // Check for null/undefined/non-string
  if (!url || typeof url !== 'string') {
    return false;
  }

  const trimmedUrl = url.trim();

  // Empty URLs are invalid
  if (trimmedUrl.length === 0) {
    return false;
  }

  // Prevent javascript: protocol
  if (trimmedUrl.toLowerCase().startsWith('javascript:')) {
    return false;
  }

  // Prevent data: URIs (can contain executable code)
  if (trimmedUrl.toLowerCase().startsWith('data:')) {
    return false;
  }

  // Prevent vbscript: protocol
  if (trimmedUrl.toLowerCase().startsWith('vbscript:')) {
    return false;
  }

  // Prevent file: protocol
  if (trimmedUrl.toLowerCase().startsWith('file:')) {
    return false;
  }

  try {
    // Try to parse as URL to ensure it's valid
    const parsed = new URL(trimmedUrl);

    // Only allow http, https, and mailto protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return false;
    }

    return true;
  } catch {
    // If URL parsing fails, check if it's a relative URL
    // Relative URLs are okay (e.g., /about, ./file.html)
    if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
      // Make sure it doesn't try to use protocol after the relative part
      if (trimmedUrl.includes('javascript:') || trimmedUrl.includes('data:')) {
        return false;
      }
      return true;
    }

    // Not a valid absolute URL and not a valid relative URL
    return false;
  }
};

/**
 * Sanitizes link text to prevent XSS
 * Removes HTML tags (including script content) and decodes entities
 *
 * @param text - The link text to sanitize
 * @returns Sanitized text safe for display
 */
export const sanitizeLinkText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove script tags and their content first
  let sanitized = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove all other HTML tags (but keep their content)
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Decode common HTML entities for display
  const entities: Record<string, string> = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
  };

  Object.keys(entities).forEach((entity) => {
    sanitized = sanitized.replace(new RegExp(entity, 'g'), entities[entity]);
  });

  return sanitized;
};