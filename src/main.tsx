import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import AppRouter, { router } from "./AppRouter.tsx";
import { getConfig } from "./config";

import "./index.css";

// After login, Auth0 redirects back here. onRedirectCallback sends the user
// to appState.returnTo (set by loginWithRedirect callers) instead of root.

// Please see https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html
// for a full list of the available properties on the provider
const config = getConfig();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      // Tokens default to in-memory storage, which is wiped by any full page
      // load. Restoring the session then relies on a silent-auth iframe to the
      // Auth0 domain, and browsers block that cookie as third-party — so every
      // reload came back logged out and the Albums link never appeared.
      cacheLocation="localstorage"
      onRedirectCallback={(appState) => {
        // Navigate in-app rather than window.location.replace: a hard
        // navigation here reloads the page immediately after the code
        // exchange, before isAuthenticated ever reaches the components.
        router.navigate(appState?.returnTo ?? '/', { replace: true });
      }}
      authorizationParams={{
        redirect_uri: config.redirectUri,
        // Without an audience, getAccessTokenSilently returns an opaque token
        // that the worker can't verify. Including it produces a JWT keyed to
        // the worker's AUTH0_AUDIENCE so logged-in callers see private/
        // unlisted albums.
        ...(config.audience ? { audience: config.audience } : {}),
      }}>
      <AppRouter />
    </Auth0Provider>
  </React.StrictMode>
);
