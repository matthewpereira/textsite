import { render, screen, waitFor } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import GalleryWrapper from './GalleryWrapper';
import getGalleryImages from '../components/getGalleryImages';
import { resolveAlbumId } from '../config/albumRedirects';

// Mock Auth0
jest.mock('@auth0/auth0-react');

// Mock getGalleryImages
jest.mock('../components/getGalleryImages', () => ({
  __esModule: true,
  default: jest.fn(),
  NotFoundError: class NotFoundError extends Error {
    constructor(albumId: string) {
      super(`Album not found: ${albumId}`);
      this.name = 'NotFoundError';
    }
  },
}));

// Mock resolveAlbumId
jest.mock('../config/albumRedirects', () => ({
  resolveAlbumId: jest.fn(),
}));

// Mock config
jest.mock('../config', () => ({
  STORAGE_PROVIDER: 'r2',
  R2_API_URL: 'https://api.example.com',
  IMAGES_PER_PAGE: 20,
}));

// Mock PaginationContextProvider
jest.mock('../context/PaginationContext', () => ({
  PaginationContextProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock Menu and Gallery components
jest.mock('../components/Menu', () => ({
  __esModule: true,
  default: () => <div data-testid="menu">Menu</div>,
}));

jest.mock('../components/Gallery', () => ({
  __esModule: true,
  default: ({ galleryObject }: any) => (
    <div data-testid="gallery">
      <div>{galleryObject.albumName}</div>
    </div>
  ),
}));

const mockUseAuth0 = useAuth0 as jest.MockedFunction<typeof useAuth0>;
const mockGetGalleryImages = getGalleryImages as jest.MockedFunction<typeof getGalleryImages>;
const mockResolveAlbumId = resolveAlbumId as jest.MockedFunction<typeof resolveAlbumId>;

describe('GalleryWrapper - 404 Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Requirement 3.3: Denied album shows not-found (404 handling)
  it('should show not-found state when album returns 404', async () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { sub: 'user123' },
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn().mockResolvedValue('test-token'),
    } as any);

    mockResolveAlbumId.mockResolvedValue('family-only-album');

    // Mock getGalleryImages to throw NotFoundError (simulating 404 from Worker)
    const NotFoundErrorClass = (getGalleryImages as any).NotFoundError;
    mockGetGalleryImages.mockRejectedValue(new NotFoundErrorClass('family-only-album'));

    render(<GalleryWrapper albumCode="family-only-album" />);

    // Wait for the not-found message to appear
    await waitFor(() => {
      expect(screen.getByText('Album not found')).toBeInTheDocument();
    });

    // Verify: menu is still rendered (not a login loop, not a crash)
    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });

  // Requirement 3.3: Anonymous visitor gets 404 gracefully
  it('should show not-found state for anonymous visitor on denied album', async () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: undefined,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn(),
    } as any);

    mockResolveAlbumId.mockResolvedValue('private-album');

    // Mock getGalleryImages to throw NotFoundError
    const NotFoundErrorClass = (getGalleryImages as any).NotFoundError;
    mockGetGalleryImages.mockRejectedValue(new NotFoundErrorClass('private-album'));

    render(<GalleryWrapper albumCode="private-album" />);

    // Wait for the not-found message to appear
    await waitFor(() => {
      expect(screen.getByText('Album not found')).toBeInTheDocument();
    });

    // Verify: no login redirect happened (no loginWithRedirect call)
    expect(mockUseAuth0().loginWithRedirect).not.toHaveBeenCalled();
  });

  // Requirement 3.3: Other errors fall back gracefully (not a login loop)
  it('should handle non-404 errors gracefully and fall back to default', async () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: undefined,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn(),
    } as any);

    mockResolveAlbumId.mockResolvedValue('some-album');

    // First call throws a generic error, second call (fallback to default) succeeds
    mockGetGalleryImages
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        albumName: 'Default Gallery',
        captions: 'right',
        description: 'Unable to load the requested gallery.',
        loadedImages: [],
      });

    render(<GalleryWrapper albumCode="some-album" />);

    // Wait for the gallery to render (fallback to default)
    await waitFor(() => {
      expect(screen.getByText('Default Gallery')).toBeInTheDocument();
    });
  });

  it('should successfully load an album', async () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: undefined,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn(),
    } as any);

    mockResolveAlbumId.mockResolvedValue('test-album');

    mockGetGalleryImages.mockResolvedValue({
      albumName: 'Test Album',
      captions: 'bottom',
      description: 'A test album',
      loadedImages: [],
    });

    render(<GalleryWrapper albumCode="test-album" />);

    // Wait for the gallery to render
    await waitFor(() => {
      expect(screen.getByText('Test Album')).toBeInTheDocument();
    });

    // Verify: menu is rendered
    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });
});

describe('GalleryWrapper - Token Forwarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Requirement 3.1: Token forwarded for authenticated users
  it('should forward token when user is authenticated', async () => {
    const mockGetToken = jest.fn().mockResolvedValue('auth-token-123');
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { sub: 'user123' },
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: mockGetToken,
    } as any);

    mockResolveAlbumId.mockResolvedValue('private-album');

    mockGetGalleryImages.mockResolvedValue({
      albumName: 'Private Album',
      captions: 'bottom',
      description: 'A private album',
      loadedImages: [],
    });

    render(<GalleryWrapper albumCode="private-album" />);

    // Wait for the gallery to render
    await waitFor(() => {
      expect(screen.getByText('Private Album')).toBeInTheDocument();
    });

    // Verify: getGalleryImages was called with the token
    expect(mockGetGalleryImages).toHaveBeenCalledWith('private-album', 'auth-token-123');
  });

  // Requirement 3.1: No token for anonymous users
  it('should not forward token when user is anonymous', async () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: undefined,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn(),
    } as any);

    mockResolveAlbumId.mockResolvedValue('public-album');

    mockGetGalleryImages.mockResolvedValue({
      albumName: 'Public Album',
      captions: 'bottom',
      description: 'A public album',
      loadedImages: [],
    });

    render(<GalleryWrapper albumCode="public-album" />);

    // Wait for the gallery to render
    await waitFor(() => {
      expect(screen.getByText('Public Album')).toBeInTheDocument();
    });

    // Verify: getGalleryImages was called without a token
    expect(mockGetGalleryImages).toHaveBeenCalledWith('public-album', undefined);
  });
});
