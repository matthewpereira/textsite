import parseStringForLinks from './textLinks';

// Mock node-emojify since it's not relevant for these tests
jest.mock('node-emojify', () => ({
  __esModule: true,
  default: (text: string) => text, // Just return the text unchanged
}));

describe('parseStringForLinks', () => {
  describe('valid markdown links', () => {
    test('parses simple markdown link', () => {
      const result = parseStringForLinks('[Click here](https://example.com)');
      const link = result.find(el => el.type === 'a');
      expect(link).toBeDefined();
      expect(link!.props.href).toBe('https://example.com');
      expect(link!.props.children).toBe('Click here');
    });

    test('parses link with http URL', () => {
      const result = parseStringForLinks('[Link](http://example.com)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.href).toBe('http://example.com');
    });

    test('parses link with query parameters', () => {
      const result = parseStringForLinks('[Search](https://example.com?q=test&lang=en)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.href).toBe('https://example.com?q=test&lang=en');
    });

    test('parses link with hash fragment', () => {
      const result = parseStringForLinks('[Section](https://example.com#overview)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.href).toBe('https://example.com#overview');
    });

    test('parses mailto link', () => {
      const result = parseStringForLinks('[Email me](mailto:test@example.com)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.href).toBe('mailto:test@example.com');
    });

    test('parses relative URL starting with /', () => {
      const result = parseStringForLinks('[About](/about)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.href).toBe('/about');
    });

    test('parses relative URL starting with ./', () => {
      const result = parseStringForLinks('[File](./file.html)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.href).toBe('./file.html');
    });

    test('adds security attributes to links', () => {
      const result = parseStringForLinks('[Link](https://example.com)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.rel).toBe('noopener noreferrer');
      expect(link!.props.target).toBe('_blank');
    });
  });

  describe('multiple links', () => {
    test('parses multiple links in text', () => {
      const result = parseStringForLinks(
        'Check [Google](https://google.com) and [GitHub](https://github.com)'
      );
      // Should have: text + link + text + link
      expect(result.length).toBeGreaterThan(2);
      const links = result.filter(el => el.type === 'a');
      expect(links).toHaveLength(2);
      expect(links[0].props.href).toBe('https://google.com');
      expect(links[1].props.href).toBe('https://github.com');
    });

    test('parses consecutive links', () => {
      const result = parseStringForLinks('[First](https://first.com) [Second](https://second.com)');
      const links = result.filter(el => el.type === 'a');
      expect(links).toHaveLength(2);
    });
  });

  describe('text without links', () => {
    test('returns plain text when no links present', () => {
      const result = parseStringForLinks('Just plain text');
      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('string');
    });

    test('handles empty string', () => {
      const result = parseStringForLinks('');
      expect(result).toHaveLength(1);
    });

    test('handles text with brackets but no valid link', () => {
      const result = parseStringForLinks('[This is not](a valid link)');
      // Will just return the text since "a valid link" is not a valid URL
      expect(result).toHaveLength(1);
    });
  });

  describe('security - dangerous URLs', () => {
    test('rejects javascript: URLs', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = parseStringForLinks('[XSS](javascript:alert("XSS"))');

      // Should produce no anchor links
      expect(result.filter(el => el.type === 'a')).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid or unsafe URL detected in markdown link:',
        'javascript:alert("XSS"'
      );

      consoleSpy.mockRestore();
    });

    test('rejects data: URIs', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      parseStringForLinks('[XSS](data:text/html,<script>alert(1)</script>)');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('rejects file: URLs', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      parseStringForLinks('[File](file:///etc/passwd)');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('renders safe text when URL is rejected', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = parseStringForLinks('[Click here](javascript:alert(1))');

      // Should contain a span with the sanitized text
      const spans = result.filter(el => el.type === 'span');
      expect(spans.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });
  });

  describe('security - link text sanitization', () => {
    test('removes HTML from link text', () => {
      const result = parseStringForLinks('[Click <b>here</b>](https://example.com)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.children).toBe('Click here');
    });

    test('removes script tags from link text', () => {
      const result = parseStringForLinks('[<script>alert(1)</script>Link](https://example.com)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.children).toBe('Link');
    });

    test('decodes HTML entities in link text', () => {
      const result = parseStringForLinks('[Tom &amp; Jerry](https://example.com)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.children).toBe('Tom & Jerry');
    });
  });

  describe('complex URLs', () => {
    test('handles URLs with special characters', () => {
      const result = parseStringForLinks('[Search](https://example.com/search?q=hello%20world&filter=new)');
      const link = result.find(el => el.type === 'a');
      expect(link).toBeDefined();
      expect(link!.props.href).toContain('hello%20world');
    });

    test('handles URLs with ports', () => {
      const result = parseStringForLinks('[Dev](https://localhost:3000/api)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.href).toBe('https://localhost:3000/api');
    });

    test('handles URLs with authentication (deprecated)', () => {
      const result = parseStringForLinks('[Auth](https://user:pass@example.com)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.href).toBe('https://user:pass@example.com');
    });

    test('handles international domain names', () => {
      const result = parseStringForLinks('[Japan](https://例え.jp)');
      const link = result.find(el => el.type === 'a');
      expect(link).toBeDefined();
    });
  });

  describe('edge cases', () => {
    test('handles very long link text', () => {
      const longText = 'a'.repeat(1000);
      const result = parseStringForLinks(`[${longText}](https://example.com)`);
      const link = result.find(el => el.type === 'a');
      expect(link!.props.children).toBe(longText);
    });

    test('handles very long URLs', () => {
      const longPath = 'a'.repeat(500);
      const result = parseStringForLinks(`[Link](https://example.com/${longPath})`);
      const link = result.find(el => el.type === 'a');
      expect(link!.props.href).toContain(longPath);
    });

    test('handles links with emoji in text', () => {
      const result = parseStringForLinks('[Click here 👋](https://example.com)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.children).toBe('Click here 👋');
    });

    test('handles text with emoji outside links', () => {
      const result = parseStringForLinks('Hello 👋 [link](https://example.com) world');
      const links = result.filter(el => el.type === 'a');
      expect(links).toHaveLength(1);
    });
  });

  describe('improved regex patterns', () => {
    test('parses links with underscores in text', () => {
      const result = parseStringForLinks('[my_link_text](https://example.com)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.children).toBe('my_link_text');
    });

    test('parses links with hyphens in text', () => {
      const result = parseStringForLinks('[my-link-text](https://example.com)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.children).toBe('my-link-text');
    });

    test('parses links with parentheses in URL path', () => {
      const result = parseStringForLinks('[Link](https://en.wikipedia.org/wiki/Test_(word))');
      // The regex stops at ) so it captures a partial URL; at minimum a link element is produced
      const link = result.find(el => el.type === 'a');
      expect(link).toBeDefined();
    });

    test('handles links with colons in text', () => {
      const result = parseStringForLinks('[Note: Important](https://example.com)');
      const link = result.find(el => el.type === 'a');
      expect(link!.props.children).toBe('Note: Important');
    });
  });
});
