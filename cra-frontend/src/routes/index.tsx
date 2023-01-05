import React from "react";
import { Outlet, createBrowserRouter } from "react-router-dom";

import Authenticate from "@/features/auth/routes/Authenticate";
import { ErrorPage } from "@/features/misc/routes/ErrorPage";
import { protectedRoutes } from "./protected";
import { Landing } from "@/features/misc";

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
    ],
  },
]);
