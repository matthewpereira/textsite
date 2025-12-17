import { validateMarkdownUrl, sanitizeLinkText } from './validateMarkdownUrl';

describe('validateMarkdownUrl', () => {
  describe('valid URLs', () => {
    test('accepts https URLs', () => {
      expect(validateMarkdownUrl('https://example.com')).toBe(true);
    });

    test('accepts http URLs', () => {
      expect(validateMarkdownUrl('http://example.com')).toBe(true);
    });

    test('accepts URLs with paths', () => {
      expect(validateMarkdownUrl('https://example.com/path/to/page')).toBe(true);
    });

    test('accepts URLs with query parameters', () => {
      expect(validateMarkdownUrl('https://example.com?foo=bar&baz=qux')).toBe(true);
    });

    test('accepts URLs with hash fragments', () => {
      expect(validateMarkdownUrl('https://example.com#section')).toBe(true);
    });

    test('accepts mailto links', () => {
      expect(validateMarkdownUrl('mailto:test@example.com')).toBe(true);
    });

    test('accepts relative URLs starting with /', () => {
      expect(validateMarkdownUrl('/about')).toBe(true);
    });

    test('accepts relative URLs starting with ./', () => {
      expect(validateMarkdownUrl('./file.html')).toBe(true);
    });

    test('accepts relative URLs starting with ../', () => {
      expect(validateMarkdownUrl('../parent/file.html')).toBe(true);
    });

    test('trims whitespace', () => {
      expect(validateMarkdownUrl('  https://example.com  ')).toBe(true);
    });
  });

  describe('invalid/dangerous URLs', () => {
    test('rejects javascript: URLs', () => {
      expect(validateMarkdownUrl('javascript:alert("XSS")')).toBe(false);
    });

    test('rejects javascript: URLs with mixed case', () => {
      expect(validateMarkdownUrl('JavaScript:alert("XSS")')).toBe(false);
    });

    test('rejects data: URIs', () => {
      expect(validateMarkdownUrl('data:text/html,<script>alert("XSS")</script>')).toBe(false);
    });

    test('rejects vbscript: URLs', () => {
      expect(validateMarkdownUrl('vbscript:msgbox("XSS")')).toBe(false);
    });

    test('rejects file: URLs', () => {
      expect(validateMarkdownUrl('file:///etc/passwd')).toBe(false);
    });

    test('rejects ftp: URLs', () => {
      expect(validateMarkdownUrl('ftp://example.com/file.txt')).toBe(false);
    });

    test('rejects empty strings', () => {
      expect(validateMarkdownUrl('')).toBe(false);
    });

    test('rejects whitespace-only strings', () => {
      expect(validateMarkdownUrl('   ')).toBe(false);
    });

    test('rejects null', () => {
      expect(validateMarkdownUrl(null as any)).toBe(false);
    });

    test('rejects undefined', () => {
      expect(validateMarkdownUrl(undefined as any)).toBe(false);
    });

    test('rejects non-string values', () => {
      expect(validateMarkdownUrl(123 as any)).toBe(false);
    });

    test('rejects relative URLs with javascript: embedded', () => {
      expect(validateMarkdownUrl('/path?redirect=javascript:alert(1)')).toBe(false);
    });

    test('rejects relative URLs with data: embedded', () => {
      expect(validateMarkdownUrl('./file?url=data:text/html,<script>')).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('handles very long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000);
      expect(validateMarkdownUrl(longUrl)).toBe(true);
    });

    test('handles URLs with special characters in query', () => {
      expect(validateMarkdownUrl('https://example.com?q=hello%20world')).toBe(true);
    });

    test('handles URLs with ports', () => {
      expect(validateMarkdownUrl('https://example.com:8080/path')).toBe(true);
    });

    test('handles URLs with userinfo (deprecated but valid)', () => {
      expect(validateMarkdownUrl('https://user:pass@example.com')).toBe(true);
    });

    test('handles URLs with international characters', () => {
      expect(validateMarkdownUrl('https://例え.jp')).toBe(true);
    });
  });
});

describe('sanitizeLinkText', () => {
  test('removes HTML tags', () => {
    expect(sanitizeLinkText('Click <b>here</b>')).toBe('Click here');
  });

  test('removes script tags', () => {
    expect(sanitizeLinkText('<script>alert("XSS")</script>Link')).toBe('Link');
  });

  test('decodes common HTML entities', () => {
    expect(sanitizeLinkText('&lt;script&gt;')).toBe('<script>');
  });

  test('decodes &amp; entity', () => {
    expect(sanitizeLinkText('Tom &amp; Jerry')).toBe('Tom & Jerry');
  });

  test('decodes &quot; entity', () => {
    expect(sanitizeLinkText('Say &quot;hello&quot;')).toBe('Say "hello"');
  });

  test('decodes &#39; entity', () => {
    expect(sanitizeLinkText("It&#39;s working")).toBe("It's working");
  });

  test('handles plain text without changes', () => {
    expect(sanitizeLinkText('Simple link text')).toBe('Simple link text');
  });

  test('handles empty string', () => {
    expect(sanitizeLinkText('')).toBe('');
  });

  test('handles null', () => {
    expect(sanitizeLinkText(null as any)).toBe('');
  });

  test('handles undefined', () => {
    expect(sanitizeLinkText(undefined as any)).toBe('');
  });

  test('handles multiple HTML tags', () => {
    expect(sanitizeLinkText('<div><span>Text</span></div>')).toBe('Text');
  });

  test('handles self-closing tags', () => {
    expect(sanitizeLinkText('Line 1<br/>Line 2')).toBe('Line 1Line 2');
  });

  test('preserves emoji and special characters', () => {
    expect(sanitizeLinkText('Hello 👋 World!')).toBe('Hello 👋 World!');
  });

  test('handles mixed content', () => {
    expect(sanitizeLinkText('<b>Bold</b> &amp; <i>italic</i>')).toBe('Bold & italic');
  });
});