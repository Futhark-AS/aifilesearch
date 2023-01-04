import React from "react";
import { Provider } from "react-redux";
import { store, AppDispatch } from "./app/store";
import "./index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { hydrate } from "./features/auth/authSlice";
import storage from "./utils/storage";

const container = document.getElementById("root");

if (!container) throw new Error("Could not find root element with id 'root'");

const root = createRoot(container);

const router = createBrowserRouter([
  {
    path: "*",
    element: <AppRoutes />,
    children: [
      {
        path: "*",
        element: <div>Not found!</div>,
      },
    ],
  },
]);

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
      <GoogleOAuthProvider
        clientId={
          "1060860818910-of2mib6de089jn475e0ivlf80r849cm5.apps.googleusercontent.com"
        }
      >
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);
