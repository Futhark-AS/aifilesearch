import { MainLayout } from "@/components/Layout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Dashboard } from "@/features/misc";
import { ProjectRoutes } from "@/features/projects/routes";
import React from "react";
import { Outlet } from "react-router-dom";
import { UserRoutes } from "../features/users/routes/index";

const App = () => {
  useAuth({ refetch: true });

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
