import React from "react";
import "./index.css";
import App from "./App";
import { store } from "./app/store";
import { Provider } from "react-redux";

import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { GoogleOAuthProvider } from "@react-oauth/google";

const container = document.getElementById("root");

if (!container) throw new Error("Could not find root element with id 'root'");

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <GoogleOAuthProvider
          clientId={
            "1060860818910-of2mib6de089jn475e0ivlf80r849cm5.apps.googleusercontent.com"
          }
        >
          <AppRoutes />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
