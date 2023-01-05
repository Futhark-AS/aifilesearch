import React from "react";
import { useRoutes } from "react-router-dom";

import Authenticate from "@/features/auth/routes/Authenticate";
import { lazyImport } from "@/utils/lazyImport";
import { protectedRoutes } from "./protected";

const { Landing } = lazyImport(() => import('@/features/misc'), 'Landing');

export const AppRoutes = () => {
  const commonRoutes = [
    { path: "/", element: <Landing /> },
    { path: "/auth", element: <Authenticate /> },
  ];

  const element = useRoutes([...protectedRoutes, ...commonRoutes]);

  return <>{element}</>;
};
