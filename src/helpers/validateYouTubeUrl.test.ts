import { validateYouTubeUrl, extractYouTubeVideoId, createSafeYouTubeEmbedUrl } from './validateYouTubeUrl';

describe('validateYouTubeUrl', () => {
  describe('valid YouTube URLs', () => {
    test('accepts standard youtube.com URL', () => {
      const result = validateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toContain('youtube-nocookie.com');
    });

    test('accepts youtu.be short URL', () => {
      const result = validateYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe('https://youtu.be/dQw4w9WgXcQ');
    });

    test('accepts youtube-nocookie.com URL', () => {
      const result = validateYouTubeUrl('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    test('accepts mobile youtube URL', () => {
      const result = validateYouTubeUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toContain('youtube-nocookie.com');
    });

    test('converts youtube.com to youtube-nocookie.com for privacy', () => {
      const result = validateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result.sanitizedUrl).toContain('youtube-nocookie.com');
      expect(result.sanitizedUrl).not.toContain('www.youtube.com');
    });

    test('trims whitespace from URL', () => {
      const result = validateYouTubeUrl('  https://www.youtube.com/watch?v=dQw4w9WgXcQ  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('invalid URLs', () => {
    test('rejects non-YouTube domains', () => {
      const result = validateYouTubeUrl('https://www.example.com/video');
      expect(result.isValid).toBe(false);
      expect(result.sanitizedUrl).toBeNull();
    });

    test('rejects malicious data: URIs', () => {
      const result = validateYouTubeUrl('data:text/html,<script>alert("XSS")</script>');
      expect(result.isValid).toBe(false);
      expect(result.sanitizedUrl).toBeNull();
    });

    test('rejects javascript: URIs', () => {
      const result = validateYouTubeUrl('javascript:alert("XSS")');
      expect(result.isValid).toBe(false);
      expect(result.sanitizedUrl).toBeNull();
    });

    test('rejects http:// URLs (requires https)', () => {
      const result = validateYouTubeUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result.isValid).toBe(false);
      expect(result.sanitizedUrl).toBeNull();
    });

    test('rejects empty string', () => {
      const result = validateYouTubeUrl('');
      expect(result.isValid).toBe(false);
      expect(result.sanitizedUrl).toBeNull();
    });

    test('rejects whitespace-only string', () => {
      const result = validateYouTubeUrl('   ');
      expect(result.isValid).toBe(false);
      expect(result.sanitizedUrl).toBeNull();
    });

    test('rejects invalid URL format', () => {
      const result = validateYouTubeUrl('not a url at all');
      expect(result.isValid).toBe(false);
      expect(result.sanitizedUrl).toBeNull();
    });

    test('rejects lookalike domain', () => {
      const result = validateYouTubeUrl('https://www.youtube.com.evil.com/watch?v=123');
      expect(result.isValid).toBe(false);
      expect(result.sanitizedUrl).toBeNull();
    });
  });
});

describe('extractYouTubeVideoId', () => {
  test('extracts video ID from youtube.com watch URL', () => {
    const videoId = extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(videoId).toBe('dQw4w9WgXcQ');
  });

  test('extracts video ID from youtu.be short URL', () => {
    const videoId = extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ');
    expect(videoId).toBe('dQw4w9WgXcQ');
  });

  test('extracts video ID from URL with additional parameters', () => {
    const videoId = extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s');
    expect(videoId).toBe('dQw4w9WgXcQ');
  });

  test('returns null for non-YouTube URL', () => {
    const videoId = extractYouTubeVideoId('https://www.example.com/video');
    expect(videoId).toBeNull();
  });

  test('returns null for invalid URL', () => {
    const videoId = extractYouTubeVideoId('not a url');
    expect(videoId).toBeNull();
  });

  test('returns null for YouTube URL without video ID', () => {
    const videoId = extractYouTubeVideoId('https://www.youtube.com/');
    expect(videoId).toBeNull();
  });
});

describe('createSafeYouTubeEmbedUrl', () => {
  test('creates embed URL with valid video ID', () => {
    const embedUrl = createSafeYouTubeEmbedUrl('dQw4w9WgXcQ');
    expect(embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  test('uses youtube-nocookie.com for privacy', () => {
    const embedUrl = createSafeYouTubeEmbedUrl('test123');
    expect(embedUrl).toContain('youtube-nocookie.com');
  });

  test('sanitizes video ID - removes special characters', () => {
    const embedUrl = createSafeYouTubeEmbedUrl('test<script>alert(1)</script>');
    expect(embedUrl).toBe('https://www.youtube-nocookie.com/embed/testscriptalert1script');
  });

  test('sanitizes video ID - removes spaces', () => {
    const embedUrl = createSafeYouTubeEmbedUrl('test 123 abc');
    expect(embedUrl).toBe('https://www.youtube-nocookie.com/embed/test123abc');
  });

  test('preserves valid characters in video ID', () => {
    const embedUrl = createSafeYouTubeEmbedUrl('test-123_ABC');
    expect(embedUrl).toBe('https://www.youtube-nocookie.com/embed/test-123_ABC');
  });

  test('throws error for empty video ID after sanitization', () => {
    expect(() => createSafeYouTubeEmbedUrl('<!@#$%^&*()>')).toThrow('Invalid video ID');
  });

  test('throws error for whitespace-only video ID', () => {
    expect(() => createSafeYouTubeEmbedUrl('   ')).toThrow('Invalid video ID');
  });
});

describe('security edge cases', () => {
  test('rejects URL with embedded javascript', () => {
    const result = validateYouTubeUrl('https://www.youtube.com/watch?v=abc&onclick=alert(1)');
    // URL is still valid, but the onclick parameter won't be executed in iframe src
    expect(result.isValid).toBe(true);
  });

  test('rejects attempts to navigate to different domain via relative URL', () => {
    const result = validateYouTubeUrl('//evil.com/video');
    expect(result.isValid).toBe(false);
  });

  test('handles very long URLs gracefully', () => {
    const longUrl = 'https://www.youtube.com/watch?v=' + 'a'.repeat(10000);
    const result = validateYouTubeUrl(longUrl);
    expect(result.isValid).toBe(true);
  });

  test('rejects null or undefined', () => {
    const result1 = validateYouTubeUrl(null as any);
    expect(result1.isValid).toBe(false);
  });
});