import getGalleryImages, { NotFoundError } from './getGalleryImages';
import * as r2Service from '../services/r2';

// Mock R2 service
jest.mock('../services/r2', () => ({
  fetchR2Album: jest.fn(),
}));

// Mock config
jest.mock('../config', () => ({
  STORAGE_PROVIDER: 'r2',
  IMGUR_AUTHORIZATION: 'test-auth',
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  logger: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock window.location for local development check
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://matthewpereira.com/',
  },
});

const mockFetchR2Album = r2Service.fetchR2Album as jest.MockedFunction<typeof r2Service.fetchR2Album>;

describe('getGalleryImages - Cache and 404 Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  // Requirement 3.2: Authed response bypasses the anonymous cache
  it('should not cache authed responses in sessionStorage', async () => {
    const mockAlbum = {
      id: 'private-album',
      title: 'Private Album',
      images: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockFetchR2Album.mockResolvedValue(mockAlbum);

    // Fetch with token (authed)
    const result = await getGalleryImages('private-album', 'auth-token');

    // Verify: result is correct
    expect(result.albumName).toBe('Private Album');

    // Verify: sessionStorage is empty (authed responses not cached)
    const cachedData = sessionStorage.getItem('textsite_gallery_private-album');
    expect(cachedData).toBeNull();
  });

  // Requirement 3.2: Anonymous response is cached
  it('should cache anonymous responses in sessionStorage', async () => {
    const mockAlbum = {
      id: 'public-album',
      title: 'Public Album',
      images: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockFetchR2Album.mockResolvedValue(mockAlbum);

    // Fetch without token (anonymous)
    const result = await getGalleryImages('public-album');

    // Verify: result is correct
    expect(result.albumName).toBe('Public Album');

    // Verify: sessionStorage has the cached data
    const cachedData = sessionStorage.getItem('textsite_gallery_public-album');
    expect(cachedData).not.toBeNull();
  });

  // Requirement 3.2: Authed response does not serve from anonymous cache
  it('should not serve cached authed response to anonymous visitor', async () => {
    const mockAlbum = {
      id: 'mixed-album',
      title: 'Mixed Album',
      images: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockFetchR2Album.mockResolvedValue(mockAlbum);

    // First: authenticated user fetches the album
    await getGalleryImages('mixed-album', 'auth-token');

    // Verify: first call was made
    expect(mockFetchR2Album).toHaveBeenCalledTimes(1);

    // Second: anonymous visitor fetches the same album
    // If the cache was not properly separated, this would return the cached authed result
    await getGalleryImages('mixed-album');

    // Verify: second call was also made (not served from cache)
    expect(mockFetchR2Album).toHaveBeenCalledTimes(2);
  });

  // Requirement 3.2: Anonymous cache hit avoids network call
  it('should return cached anonymous response on second anonymous fetch', async () => {
    const mockAlbum = {
      id: 'public-album',
      title: 'Public Album',
      images: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockFetchR2Album.mockResolvedValue(mockAlbum);

    // First anonymous fetch
    await getGalleryImages('public-album');
    expect(mockFetchR2Album).toHaveBeenCalledTimes(1);

    // Second anonymous fetch (should use cache)
    await getGalleryImages('public-album');

    // Verify: network call was not made again (cache hit)
    expect(mockFetchR2Album).toHaveBeenCalledTimes(1);
  });

  // Requirement 3.3: 404 response throws NotFoundError
  it('should throw NotFoundError on 404 response from R2', async () => {
    mockFetchR2Album.mockRejectedValue(new Error('Failed to fetch album: 404 Not Found'));

    // Attempt to fetch album that returns 404
    await expect(getGalleryImages('missing-album')).rejects.toThrow(NotFoundError);
  });

  // Requirement 3.3: NotFoundError is specific to 404
  it('should throw NotFoundError only for 404 errors', async () => {
    mockFetchR2Album.mockRejectedValue(new Error('Failed to fetch album: 500 Internal Server Error'));

    // Attempt to fetch album that returns 500
    // This should not throw NotFoundError, but a generic error
    const result = await getGalleryImages('error-album');

    // For non-404 errors, should return default gallery
    expect(result.albumName).toContain('Default Gallery');
  });

  it('should distinguish between 404 and network errors', async () => {
    const notFoundError = new Error('Failed to fetch album: 404 Not Found');
    const networkError = new Error('Network timeout');

    // First call: 404
    mockFetchR2Album.mockRejectedValueOnce(notFoundError);

    await expect(getGalleryImages('not-found-album')).rejects.toThrow(NotFoundError);

    // Second call: network error (not 404)
    mockFetchR2Album.mockRejectedValueOnce(networkError);

    const result = await getGalleryImages('network-error-album');

    // Network errors should return default gallery, not throw NotFoundError
    expect(result.albumName).toContain('Default Gallery');
  });

  it('should handle successful fetch correctly', async () => {
    const mockAlbum = {
      id: 'success-album',
      title: 'Success Album',
      images: [
        {
          id: 'img1',
          url: 'https://example.com/img1.jpg',
          thumbnailUrl: 'https://example.com/img1-thumb.jpg',
          type: 'image/jpeg',
          size: 1000,
          width: 800,
          height: 600,
          datetime: 1234567890,
          link: 'https://example.com/img1.jpg',
        } as any,
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockFetchR2Album.mockResolvedValue(mockAlbum as any);

    const result = await getGalleryImages('success-album');

    expect(result.albumName).toBe('Success Album');
    expect(result.loadedImages).toHaveLength(1);
    expect(result.loadedImages[0].link).toBe('https://example.com/img1.jpg');
  });
});
