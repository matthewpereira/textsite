describe('Permalink URL Parsing', () => {
  test('extracts photo ID from hash #p/abc123', () => {
    const hash = '#p/abc123';
    const match = hash.match(/#p\/([^/?#]+)/);
    const photoId = match ? match[1] : null;

    expect(photoId).toBe('abc123');
  });

  test('photo ID is independent of page number', () => {
    // Page number is automatically calculated from photo ID
    // URL format is just #p/photoId, not #page/p/photoId
    const hash = '#p/xyz789';
    const match = hash.match(/#p\/([^/?#]+)/);
    const photoId = match ? match[1] : null;

    expect(photoId).toBe('xyz789');
  });

  test('returns null for hash without photo ID', () => {
    const hash = '#3';
    const match = hash.match(/#p\/([^/?#]+)/);
    const photoId = match ? match[1] : null;

    expect(photoId).toBeNull();
  });

  test('returns null for empty hash', () => {
    const hash = '';
    const match = hash.match(/#p\/([^/?#]+)/);
    const photoId = match ? match[1] : null;

    expect(photoId).toBeNull();
  });

  test('extracts alphanumeric photo IDs', () => {
    const hash = '#p/Vcu9we7';
    const match = hash.match(/#p\/([^/?#]+)/);
    const photoId = match ? match[1] : null;

    expect(photoId).toBe('Vcu9we7');
  });

  test('handles photo ID with query parameters', () => {
    const hash = '#p/abc123?foo=bar';
    const match = hash.match(/#p\/([^/?#]+)/);
    const photoId = match ? match[1] : null;

    expect(photoId).toBe('abc123');
  });
});

describe('Find Page For Photo', () => {
  const IMAGES_PER_PAGE = 50;

  const createMockImages = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `img${i}`,
      title: `Image ${i}`,
      link: `https://example.com/img${i}.jpg`
    }));
  };

  const findPageForPhoto = (images: any[], photoId: string, imagesPerPage: number): number | null => {
    const imageIndex = images.findIndex((img: any) => img.id === photoId);
    if (imageIndex === -1) return null;
    return Math.floor(imageIndex / imagesPerPage);
  };

  test('finds correct page for first image', () => {
    const images = createMockImages(100);
    const page = findPageForPhoto(images, 'img0', IMAGES_PER_PAGE);

    expect(page).toBe(0);
  });

  test('finds correct page for last image on first page', () => {
    const images = createMockImages(100);
    const page = findPageForPhoto(images, 'img49', IMAGES_PER_PAGE);

    expect(page).toBe(0);
  });

  test('finds correct page for first image on second page', () => {
    const images = createMockImages(100);
    const page = findPageForPhoto(images, 'img50', IMAGES_PER_PAGE);

    expect(page).toBe(1);
  });

  test('finds correct page for middle image', () => {
    const images = createMockImages(100);
    const page = findPageForPhoto(images, 'img75', IMAGES_PER_PAGE);

    expect(page).toBe(1);
  });

  test('finds correct page for last image', () => {
    const images = createMockImages(100);
    const page = findPageForPhoto(images, 'img99', IMAGES_PER_PAGE);

    expect(page).toBe(1);
  });

  test('returns null for non-existent photo ID', () => {
    const images = createMockImages(100);
    const page = findPageForPhoto(images, 'nonexistent', IMAGES_PER_PAGE);

    expect(page).toBeNull();
  });

  test('handles empty image array', () => {
    const images: any[] = [];
    const page = findPageForPhoto(images, 'img0', IMAGES_PER_PAGE);

    expect(page).toBeNull();
  });

  test('handles single page with few images', () => {
    const images = createMockImages(10);
    const page = findPageForPhoto(images, 'img5', IMAGES_PER_PAGE);

    expect(page).toBe(0);
  });

  test('finds correct page on third page', () => {
    const images = createMockImages(150);
    const page = findPageForPhoto(images, 'img125', IMAGES_PER_PAGE);

    expect(page).toBe(2);
  });
});

describe('Permalink Generation', () => {
  beforeEach(() => {
    delete (window as any).location;
    (window as any).location = {
      origin: 'https://matthewpereira.com',
      pathname: '/',
    };
  });

  test('generates correct permalink for main gallery', () => {
    const imageId = 'Vcu9we7';
    const permalink = `${window.location.origin}${window.location.pathname}#p/${imageId}`;

    expect(permalink).toBe('https://matthewpereira.com/#p/Vcu9we7');
  });

  test('generates correct permalink for album', () => {
    (window.location as any).pathname = '/a/6Hpyr';
    const imageId = 'abc123';
    const permalink = `${window.location.origin}${window.location.pathname}#p/${imageId}`;

    expect(permalink).toBe('https://matthewpereira.com/a/6Hpyr#p/abc123');
  });

  test('handles special characters in image ID', () => {
    const imageId = 'img_123-abc';
    const permalink = `${window.location.origin}${window.location.pathname}#p/${imageId}`;

    expect(permalink).toContain('img_123-abc');
  });
});

describe('Scroll Position Calculation', () => {
  test('calculates center position correctly', () => {
    const elementRect = {
      top: 500,
      height: 600,
    };
    const windowHeight = 800;
    const pageYOffset = 0;

    const absoluteElementTop = elementRect.top + pageYOffset;
    const middle = absoluteElementTop - (windowHeight / 2) + (elementRect.height / 2);

    // Element at 500, window height 800, element height 600
    // Middle = 500 - 400 + 300 = 400
    expect(middle).toBe(400);
  });

  test('ensures scroll position is not negative', () => {
    const middle = -100;
    const scrollPosition = Math.max(0, middle);

    expect(scrollPosition).toBe(0);
  });

  test('calculates correct position for tall image', () => {
    const elementRect = {
      top: 100,
      height: 1200,
    };
    const windowHeight = 800;
    const pageYOffset = 0;

    const absoluteElementTop = elementRect.top + pageYOffset;
    const middle = absoluteElementTop - (windowHeight / 2) + (elementRect.height / 2);

    // Element at 100, window height 800, element height 1200
    // Middle = 100 - 400 + 600 = 300
    expect(middle).toBe(300);
  });

  test('handles scrolled page', () => {
    const elementRect = {
      top: 200,
      height: 400,
    };
    const windowHeight = 800;
    const pageYOffset = 1000;

    const absoluteElementTop = elementRect.top + pageYOffset;
    const middle = absoluteElementTop - (windowHeight / 2) + (elementRect.height / 2);

    // Element at 200 + 1000 = 1200, window height 800, element height 400
    // Middle = 1200 - 400 + 200 = 1000
    expect(middle).toBe(1000);
  });
});