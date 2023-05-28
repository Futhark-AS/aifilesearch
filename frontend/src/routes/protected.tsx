import { MainLayout } from "@/components/Layout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Dashboard } from "@/features/misc";
import { ProjectRoutes } from "@/features/projects/routes";
import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { UserRoutes } from "../features/users/routes/index";
import { useAppDispatch } from "@/redux/hooks";
import { setHighlightedResult } from "@/features/projects/projectSlice";

const App = () => {
  useAuth({ refetch: true });


  // Basically a hack to reset highlighted result when user navigates away from pdf page.
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  useEffect(() => {
    if (!pathname.includes("/pdf")) {
      dispatch(setHighlightedResult(null));
    }
  }, [pathname, dispatch]);

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export const protectedRoutes = [
  {
    path: "",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "projects/", children: ProjectRoutes },
      { path: "profile/", children: UserRoutes },
    ],
  },
];
