import decodeHtmlEntities from './decodeHtmlEntities';

describe('decodeHtmlEntities', () => {
  describe('common HTML entities', () => {
    test('decodes &amp; to &', () => {
      expect(decodeHtmlEntities('Tom &amp; Jerry')).toBe('Tom & Jerry');
    });

    test('decodes &lt; to <', () => {
      expect(decodeHtmlEntities('2 &lt; 5')).toBe('2 < 5');
    });

    test('decodes &gt; to >', () => {
      expect(decodeHtmlEntities('5 &gt; 2')).toBe('5 > 2');
    });

    test('decodes &quot; to "', () => {
      expect(decodeHtmlEntities('Say &quot;hello&quot;')).toBe('Say "hello"');
    });

    test('decodes &#39; to \'', () => {
      expect(decodeHtmlEntities('It&#39;s working')).toBe("It's working");
    });

    test('decodes &#x27; to \'', () => {
      expect(decodeHtmlEntities('It&#x27;s working')).toBe("It's working");
    });

    test('decodes &apos; to \'', () => {
      expect(decodeHtmlEntities('It&apos;s working')).toBe("It's working");
    });

    test('decodes &nbsp; to non-breaking space', () => {
      expect(decodeHtmlEntities('Hello&nbsp;World')).toBe('Hello\u00A0World');
    });
  });

  describe('special characters', () => {
    test('decodes &copy; to ©', () => {
      expect(decodeHtmlEntities('&copy; 2023')).toBe('© 2023');
    });

    test('decodes &reg; to ®', () => {
      expect(decodeHtmlEntities('MyBrand&reg;')).toBe('MyBrand®');
    });

    test('decodes &deg; to °', () => {
      expect(decodeHtmlEntities('72&deg;F')).toBe('72°F');
    });

    test('decodes &plusmn; to ±', () => {
      expect(decodeHtmlEntities('&plusmn;5%')).toBe('±5%');
    });

    test('decodes &times; to ×', () => {
      expect(decodeHtmlEntities('2 &times; 3')).toBe('2 × 3');
    });

    test('decodes &divide; to ÷', () => {
      expect(decodeHtmlEntities('10 &divide; 2')).toBe('10 ÷ 2');
    });

    test('decodes &frac12; to ½', () => {
      expect(decodeHtmlEntities('&frac12; cup')).toBe('½ cup');
    });

    test('decodes &pound; to £', () => {
      expect(decodeHtmlEntities('&pound;100')).toBe('£100');
    });
  });

  describe('numeric character references - decimal', () => {
    test('decodes &#65; to A', () => {
      expect(decodeHtmlEntities('&#65;')).toBe('A');
    });

    test('decodes &#97; to a', () => {
      expect(decodeHtmlEntities('&#97;')).toBe('a');
    });

    test('decodes &#48; to 0', () => {
      expect(decodeHtmlEntities('&#48;')).toBe('0');
    });

    test('decodes &#33; to !', () => {
      expect(decodeHtmlEntities('Hello&#33;')).toBe('Hello!');
    });

    test('decodes &#169; to ©', () => {
      expect(decodeHtmlEntities('&#169; 2023')).toBe('© 2023');
    });

    test('decodes multiple numeric entities', () => {
      expect(decodeHtmlEntities('&#72;&#101;&#108;&#108;&#111;')).toBe('Hello');
    });
  });

  describe('numeric character references - hexadecimal', () => {
    test('decodes &#x41; to A', () => {
      expect(decodeHtmlEntities('&#x41;')).toBe('A');
    });

    test('decodes &#x61; to a', () => {
      expect(decodeHtmlEntities('&#x61;')).toBe('a');
    });

    test('decodes &#x30; to 0', () => {
      expect(decodeHtmlEntities('&#x30;')).toBe('0');
    });

    test('decodes &#xA9; to ©', () => {
      expect(decodeHtmlEntities('&#xA9; 2023')).toBe('© 2023');
    });

    test('decodes lowercase hex &#xa9; to ©', () => {
      expect(decodeHtmlEntities('&#xa9; 2023')).toBe('© 2023');
    });

    test('decodes multiple hex entities', () => {
      expect(decodeHtmlEntities('&#x48;&#x65;&#x6c;&#x6c;&#x6f;')).toBe('Hello');
    });
  });

  describe('security - prevents XSS', () => {
    test('does not execute script in numeric entity', () => {
      // Attempting to encode <script> as numeric entities
      const encoded = '&#60;script&#62;alert(&#39;XSS&#39;)&#60;/script&#62;';
      const result = decodeHtmlEntities(encoded);
      // Should decode to literal text, not executable script
      expect(result).toBe("<script>alert('XSS')</script>");
      // The key is it returns as a STRING, not as executable code
      expect(typeof result).toBe('string');
    });

    test('does not execute script in named entities', () => {
      const encoded = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
      const result = decodeHtmlEntities(encoded);
      expect(result).toBe('<script>alert("XSS")</script>');
      expect(typeof result).toBe('string');
    });

    test('filters out control characters except safe ones', () => {
      // Try to inject control character (ASCII 1 is not allowed)
      const result = decodeHtmlEntities('Test&#1;Text');
      // Should not decode invalid control character
      expect(result).toBe('Test&#1;Text');
    });

    test('allows safe control characters (tab, newline, carriage return)', () => {
      expect(decodeHtmlEntities('Line1&#10;Line2')).toBe('Line1\nLine2');
      expect(decodeHtmlEntities('Col1&#9;Col2')).toBe('Col1\tCol2');
      expect(decodeHtmlEntities('Text&#13;')).toBe('Text\r');
    });
  });

  describe('mixed entities', () => {
    test('decodes multiple different entities', () => {
      expect(decodeHtmlEntities('Tom &amp; Jerry &lt;&#169;&gt;')).toBe('Tom & Jerry <©>');
    });

    test('decodes entities in real-world text', () => {
      expect(decodeHtmlEntities('Price: &pound;10.99 &mdash; Save 50&percnt;!')).toBe('Price: £10.99 &mdash; Save 50&percnt;!');
    });

    test('handles text with both named and numeric entities', () => {
      expect(decodeHtmlEntities('&copy; &#50;&#48;&#50;&#51; MyCompany&reg;')).toBe('© 2023 MyCompany®');
    });
  });

  describe('edge cases', () => {
    test('returns empty string for empty input', () => {
      expect(decodeHtmlEntities('')).toBe('');
    });

    test('returns empty string for null', () => {
      expect(decodeHtmlEntities(null as any)).toBe('');
    });

    test('returns empty string for undefined', () => {
      expect(decodeHtmlEntities(undefined as any)).toBe('');
    });

    test('returns empty string for non-string input', () => {
      expect(decodeHtmlEntities(123 as any)).toBe('');
    });

    test('handles text with no entities', () => {
      expect(decodeHtmlEntities('Plain text')).toBe('Plain text');
    });

    test('handles text with emoji', () => {
      expect(decodeHtmlEntities('Hello 👋 World')).toBe('Hello 👋 World');
    });

    test('handles very long text', () => {
      const longText = 'a'.repeat(1000) + '&amp;' + 'b'.repeat(1000);
      const result = decodeHtmlEntities(longText);
      expect(result).toBe('a'.repeat(1000) + '&' + 'b'.repeat(1000));
    });

    test('handles incomplete entity at end', () => {
      expect(decodeHtmlEntities('Test &amp')).toBe('Test &amp');
    });

    test('handles entity without semicolon', () => {
      expect(decodeHtmlEntities('Test &ampTest')).toBe('Test &ampTest');
    });

    test('handles invalid entity name', () => {
      expect(decodeHtmlEntities('Test &invalid; Test')).toBe('Test &invalid; Test');
    });

    test('handles multiple consecutive entities', () => {
      expect(decodeHtmlEntities('&lt;&gt;&amp;&quot;')).toBe('<>&"');
    });
  });

  describe('real-world Imgur use cases', () => {
    test('decodes typical Imgur image title', () => {
      expect(decodeHtmlEntities('My Cat&#39;s Photo &copy; 2023')).toBe("My Cat's Photo © 2023");
    });

    test('decodes Imgur description with special chars', () => {
      expect(decodeHtmlEntities('Check out this &quot;amazing&quot; photo!')).toBe('Check out this "amazing" photo!');
    });

    test('handles HTML-encoded URLs in descriptions', () => {
      expect(decodeHtmlEntities('Visit: https://example.com?foo=bar&amp;baz=qux')).toBe('Visit: https://example.com?foo=bar&baz=qux');
    });

    test('handles user-generated content with entities', () => {
      expect(decodeHtmlEntities('3 &lt; 5 &amp; 5 &gt; 3')).toBe('3 < 5 & 5 > 3');
    });
  });
});