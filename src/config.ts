const configJson = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE
};

export const IMAGES_PER_PAGE = parseInt(import.meta.env.VITE_IMAGES_PER_PAGE || '50', 10);
export const IMGUR_AUTHORIZATION = import.meta.env.VITE_IMGUR_CLIENT_ID;

// Storage provider configuration
export const STORAGE_PROVIDER = import.meta.env.VITE_STORAGE_PROVIDER || 'imgur';

// R2 Worker API URL
export const R2_API_URL = import.meta.env.VITE_R2_API_URL || 'https://textsite-r2-api.YOUR-SUBDOMAIN.workers.dev';

export function getConfig() {
  // Configure the audience here. By default, it will take whatever is in the config
  // (specified by the `audience` key) unless it's the default value of "YOUR_API_IDENTIFIER" (which
  // is what you get sometimes by using the Auth0 sample download tool from the quickstart page, if you
  // don't have an API).
  // If this resolves to `null`, the API page changes to show some helpful info about what to do
  // with the audience.
  
  const audience =
    configJson.audience && configJson.audience !== "YOUR_API_IDENTIFIER"
      ? configJson.audience
      : null;

  return {
    domain: configJson.domain,
    clientId: configJson.clientId,
    ...(audience ? { audience } : null),
    redirectUri: window.location.origin
  };
}
