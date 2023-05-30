import React from "react";
import { Outlet, createBrowserRouter } from "react-router-dom";

import Authenticate from "@/features/auth/routes/Authenticate";
import { ErrorPage } from "@/features/errors";
import { About, Landing } from "@/features/misc";
import { protectedRoutes } from "./protected";
import { PaymentSuccess } from "../features/misc/routes/PaymentSuccess";
import { TestPdf } from "@/components/PdfViewer/TestPdf";

const Root = () => {
  console.log("hello")
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
      {
        path: "test",
        element: <TestPdf />,
      },
      {
        path: "payment-success",
        element: <PaymentSuccess />,
      },
    ],
  },
]);
