import React from "react";
import { Outlet, createBrowserRouter } from "react-router-dom";

import Authenticate from "@/features/auth/routes/Authenticate";
import { ErrorPage } from "@/features/errors";
import { About, Landing } from "@/features/misc";
import { protectedRoutes } from "./protected";
import { PdfViewerTest } from "@/components/PdfViewer/PdfViewerTest";

const Root = () => {
  return (
    <div>
      <Outlet />
      {/* <PdfViewerTest /> */}
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
