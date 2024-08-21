import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import AppRouter from "./AppRouter.tsx";
import history from "./utils/history";
import { getConfig } from "./config";

import "./index.css";

const onRedirectCallback = (appState: any) => {
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
};

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
      }}
      onRedirectCallback={onRedirectCallback}>
      <AppRouter />
    </Auth0Provider>
  </React.StrictMode>
);
