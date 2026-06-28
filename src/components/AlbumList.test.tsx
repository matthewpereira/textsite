import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import AlbumList from './AlbumList';
import * as r2Service from '../services/r2';

// Mock Auth0
jest.mock('@auth0/auth0-react');

// Mock the R2 service
jest.mock('../services/r2', () => ({
  fetchR2Albums: jest.fn(),
  fetchImgurRedirects: jest.fn(),
}));

// Mock config
jest.mock('../config', () => ({
  STORAGE_PROVIDER: 'r2',
  R2_API_URL: 'https://api.example.com',
  IMAGES_PER_PAGE: 20,
}));

const mockUseAuth0 = useAuth0 as jest.MockedFunction<typeof useAuth0>;
const mockFetchR2Albums = r2Service.fetchR2Albums as jest.MockedFunction<typeof r2Service.fetchR2Albums>;

describe('AlbumList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Requirement 2.1: Anonymous album list renders without login redirect
  it('should render anonymous public albums without forcing login', async () => {
    // Setup: anonymous user (not authenticated)
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: undefined,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn(),
    } as any);

    // Setup: mock albums list with public albums only
    mockFetchR2Albums.mockResolvedValue([
      {
        id: 'public-album-1',
        title: 'Public Album 1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'public-album-2',
        title: 'Public Album 2',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ]);

    render(
      <BrowserRouter>
        <AlbumList />
      </BrowserRouter>
    );

    // Wait for albums to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type to filter albums...')).toBeInTheDocument();
    });

    // Verify: albums are rendered
    expect(screen.getByText('Public Album 1')).toBeInTheDocument();
    expect(screen.getByText('Public Album 2')).toBeInTheDocument();

    // Verify: loginWithRedirect was NOT called
    expect(mockUseAuth0().loginWithRedirect).not.toHaveBeenCalled();
  });

  // Requirement 3.1: Token attached when authenticated; absent when anonymous
  it('should fetch albums with token when authenticated', async () => {
    // Setup: authenticated user
    const mockGetToken = jest.fn().mockResolvedValue('test-token');
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { sub: 'user123' },
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: mockGetToken,
    } as any);

    mockFetchR2Albums.mockResolvedValue([
      {
        id: 'private-album',
        title: 'Private Album',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    render(
      <BrowserRouter>
        <AlbumList />
      </BrowserRouter>
    );

    // Wait for albums to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type to filter albums...')).toBeInTheDocument();
    });

    // Verify: fetchR2Albums was called with the token
    expect(mockFetchR2Albums).toHaveBeenCalledWith('test-token');
  });

  // Requirement 3.1: Anonymous request carries no token
  it('should fetch albums without token when anonymous', async () => {
    // Setup: anonymous user
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: undefined,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn(),
    } as any);

    mockFetchR2Albums.mockResolvedValue([
      {
        id: 'public-album',
        title: 'Public Album',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    render(
      <BrowserRouter>
        <AlbumList />
      </BrowserRouter>
    );

    // Wait for albums to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type to filter albums...')).toBeInTheDocument();
    });

    // Verify: fetchR2Albums was called without a token (undefined)
    expect(mockFetchR2Albums).toHaveBeenCalledWith(undefined);
  });

  // Requirement 2.2: Sign-in affordance present but not required
  it('should show sign-in button for anonymous users', async () => {
    // Setup: anonymous user
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: undefined,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn(),
    } as any);

    mockFetchR2Albums.mockResolvedValue([
      {
        id: 'public-album',
        title: 'Public Album',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    render(
      <BrowserRouter>
        <AlbumList />
      </BrowserRouter>
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('Public Album')).toBeInTheDocument();
    });

    // Verify: login button is present in the menu
    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeInTheDocument();
  });

  it('should show logout button for authenticated users', async () => {
    // Setup: authenticated user
    const mockLogout = jest.fn();
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { sub: 'user123' },
      loginWithRedirect: jest.fn(),
      logout: mockLogout,
      getAccessTokenSilently: jest.fn().mockResolvedValue('test-token'),
    } as any);

    mockFetchR2Albums.mockResolvedValue([
      {
        id: 'private-album',
        title: 'Private Album',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    render(
      <BrowserRouter>
        <AlbumList />
      </BrowserRouter>
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('Private Album')).toBeInTheDocument();
    });

    // Verify: logout button is present in the menu
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
  });

  it('should handle token fetch failure gracefully', async () => {
    // Setup: authenticated user but token fetch fails
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { sub: 'user123' },
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn().mockRejectedValue(new Error('Token fetch failed')),
    } as any);

    mockFetchR2Albums.mockResolvedValue([
      {
        id: 'public-album',
        title: 'Public Album (Fallback)',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    render(
      <BrowserRouter>
        <AlbumList />
      </BrowserRouter>
    );

    // Wait for albums to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type to filter albums...')).toBeInTheDocument();
    });

    // Verify: albums are still rendered (fallback to anonymous fetch)
    expect(screen.getByText('Public Album (Fallback)')).toBeInTheDocument();

    // Verify: fetchR2Albums was called with undefined (fallback to anonymous)
    expect(mockFetchR2Albums).toHaveBeenCalledWith(undefined);
  });
});
