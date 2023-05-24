import React from "react";
import { Provider } from "react-redux";
import "./index.css";
import { store } from "./redux/store";

import { NotificationsProvider } from "@mantine/notifications";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "react-query";
import { RouterProvider } from "react-router-dom";
import { hydrate } from "./features/auth/authSlice";
import { queryClient } from "./lib/react-query";
import { router } from "./routes";
import storage from "./utils/storage";

const container = document.getElementById("root");

window.devMode = false;

if (!container) throw new Error("Could not find root element with id 'root'");

const root = createRoot(container);

const user = storage.getUser();
if (user) {
  store.dispatch(hydrate(user));
}

// TODO: Don't do this. Use a middleware instead.
store.subscribe(() => {
  const state = store.getState();
  const user = state.auth;
  if (user) {
    storage.setUser(user);
  } else {
    storage.clearUser();
  }
});

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider
          clientId={
            "709095520669-h5kg4joefhovabfi2m5nnrv0dt69ocm6.apps.googleusercontent.com"
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
