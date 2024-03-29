import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import history from "./utils/history";
import { getConfig } from "./config";
import AppRouter from "./AppRouter.tsx";

import "./index.css";

const onRedirectCallback = (appState: any) => {
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
};

// Please see https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html
// for a full list of the available properties on the provider
const config = getConfig();

const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  ...(config.audience ? { audience: config.audience } : {}),
  redirect_uri: window.location.origin,
  onRedirectCallback,
};


// if (
//   window.location.hostname === "localhost" ||
//   window.location.hostname === "127.0.0.1"
// ) {
//   ReactDOM.createRoot(document.getElementById("root")!).render(
//     <React.StrictMode>
//       <AppRouter />
//     </React.StrictMode>
//   );
// } else {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <Auth0Provider {...providerConfig}>
        <AppRouter />
      </Auth0Provider>
    </React.StrictMode>
  );
// };
