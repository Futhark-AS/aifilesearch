import React from "react";
import { Outlet, createBrowserRouter } from "react-router-dom";

import Authenticate from "@/features/auth/routes/Authenticate";
import { protectedRoutes } from "./protected";
import { About, Landing } from "@/features/misc";
import { ErrorPage } from "@/features/errors";

const Root = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <Root />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "app/",
        children: protectedRoutes,
      },
      {
        path: "auth",
        element: <Authenticate />,
      },
      {
        path: "about",
        element: <About />,
      },
    ],
  },
]);
