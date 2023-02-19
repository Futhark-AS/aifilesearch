import { useIsAuthenticated } from "@/redux/hooks";
import { MainLayout } from "@/components/Layout";
import { Dashboard } from "@/features/misc";
import { ProjectRoutes } from "@/features/projects/routes";
import React from "react";
import { Outlet } from "react-router-dom";
import { UserRoutes } from '../features/users/routes/index';

const App = () => {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

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
