/**
 * Safely decodes HTML entities without using innerHTML to prevent XSS
 * Handles common HTML entities and numeric character references
 *
 * @param text - The text containing HTML entities to decode
 * @returns Decoded text safe from XSS attacks
 */
const decodeHtmlEntities = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Map of common HTML entities to their decoded characters
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
    '&nbsp;': '\u00A0',
    '&iexcl;': '¡',
    '&cent;': '¢',
    '&pound;': '£',
    '&curren;': '¤',
    '&yen;': '¥',
    '&brvbar;': '¦',
    '&sect;': '§',
    '&uml;': '¨',
    '&copy;': '©',
    '&ordf;': 'ª',
    '&laquo;': '«',
    '&not;': '¬',
    '&shy;': '\u00AD',
    '&reg;': '®',
    '&macr;': '¯',
    '&deg;': '°',
    '&plusmn;': '±',
    '&sup2;': '²',
    '&sup3;': '³',
    '&acute;': '´',
    '&micro;': 'µ',
    '&para;': '¶',
    '&middot;': '·',
    '&cedil;': '¸',
    '&sup1;': '¹',
    '&ordm;': 'º',
    '&raquo;': '»',
    '&frac14;': '¼',
    '&frac12;': '½',
    '&frac34;': '¾',
    '&iquest;': '¿',
    '&times;': '×',
    '&divide;': '÷',
    // Add more common entities as needed
  };

  let decoded = text;

  // First, decode named entities
  Object.keys(htmlEntities).forEach((entity) => {
    const regex = new RegExp(entity, 'g');
    decoded = decoded.replace(regex, htmlEntities[entity]);
  });

  // Then decode numeric character references (&#123; and &#xAB;)
  // Decimal format: &#[0-9]+;
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    const charCode = parseInt(dec, 10);
    // Validate it's a safe character code (not control characters except tab, newline, carriage return)
    if (charCode === 9 || charCode === 10 || charCode === 13 || (charCode >= 32 && charCode <= 126) || charCode >= 160) {
      return String.fromCharCode(charCode);
    }
    return match; // Return original if invalid
  });

  // Hexadecimal format: &#x[0-9A-Fa-f]+;
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    const charCode = parseInt(hex, 16);
    // Validate it's a safe character code
    if (charCode === 9 || charCode === 10 || charCode === 13 || (charCode >= 32 && charCode <= 126) || charCode >= 160) {
      return String.fromCharCode(charCode);
    }
    return match; // Return original if invalid
  });

  return decoded;
};

export default decodeHtmlEntities;