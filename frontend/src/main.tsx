import React from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import "./index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { hydrate } from "./features/auth/authSlice";
import { router } from "./routes";
import storage from "./utils/storage";
import { QueryClient, QueryClientProvider } from "react-query";
import { initMocks } from "./testing/server";
import { NotificationsProvider } from "@mantine/notifications";

const container = document.getElementById("root");

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});

await initMocks();

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider
          clientId={
            "1060860818910-of2mib6de089jn475e0ivlf80r849cm5.apps.googleusercontent.com"
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
