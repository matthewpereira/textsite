const configJson = {
  domain: "dev-a1lpbdbz.us.auth0.com",
  clientId: "lngkoS4TEZxodhg4p8rgj3cNvc5d1kxN",
  authorizationParams={
    redirect_uri: window.location.origin
  },
  audience:""
};

export const IMAGES_PER_PAGE = 20;
export const IMGUR_AUTHORIZATION = "0deeb4de7f631f1";

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
  };
}
