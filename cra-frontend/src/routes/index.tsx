import React from "react";
import { createBrowserRouter, useRoutes } from "react-router-dom";

import Authenticate from "@/features/auth/routes/Authenticate";
import { lazyImport } from "@/utils/lazyImport";
import { protectedRoutes } from "./protected";
import { ErrorPage } from "@/features/misc/routes/ErrorPage";

const { Landing } = lazyImport(() => import('@/features/misc'), 'Landing');

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    children: [
      {
        path: "app/",
        children: protectedRoutes,
      },
    ],
  },
]);


export const AppRoutes = () => {
  const commonRoutes = [
    { path: "/", element: <Landing /> },
    { path: "/auth", element: <Authenticate /> },
  ];

  const element = useRoutes([...protectedRoutes, ...commonRoutes]);

  return <>{element}</>;
};
