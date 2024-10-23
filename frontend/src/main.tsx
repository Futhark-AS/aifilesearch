import React from "react";
import { Provider } from "react-redux";
import "./index.css";
import { store } from "./redux/store";

import { NotificationsProvider } from "@mantine/notifications";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "react-query";
import { RouterProvider } from "react-router-dom";
import { queryClient } from "./lib/react-query";
import { router } from "./routes";

const container = document.getElementById("root");

window.devMode = false;

if (!container) throw new Error("Could not find root element with id 'root'");

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider
          clientId={
            "1041392894738-9vvp25cehujuecelejar3kqsoh203j6p.apps.googleusercontent.com"
          }
        >
          <NotificationsProvider>
            <RouterProvider router={router} />
          </NotificationsProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
