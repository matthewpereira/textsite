import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import AppRouter from "./AppRouter.tsx";
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
      onRedirectCallback={(appState) => {
        window.location.replace(appState?.returnTo ?? '/');
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
