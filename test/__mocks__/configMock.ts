export const IMAGES_PER_PAGE = 50;
export const IMGUR_AUTHORIZATION = undefined;
export const STORAGE_PROVIDER = 'imgur';
export const R2_API_URL = 'https://test.workers.dev';

export function getConfig() {
  return {
    domain: 'test.auth0.com',
    clientId: 'test-client-id',
    redirectUri: 'http://localhost',
  };
}
