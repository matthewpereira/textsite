import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import AppRouter from "./AppRouter.tsx";
import { getConfig } from "./config";

import "./index.css";

// Let Auth0 handle the redirect callback naturally

// Please see https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html
// for a full list of the available properties on the provider
const config = getConfig();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      authorizationParams={{
        redirect_uri: config.redirectUri,
      }}>
      <AppRouter />
    </Auth0Provider>
  </React.StrictMode>
);
