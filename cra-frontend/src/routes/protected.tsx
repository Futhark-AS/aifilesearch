import { useIsAuthenticated } from "@/app/hooks";
import { MainLayout } from "@/components/Layout";
import { Dashboard } from "@/features/misc";
import { ProjectRoutes } from "@/features/projects/routes";
import React from "react";
import { Outlet } from "react-router-dom";

const App = () => {
  const isAuthenticated = useIsAuthenticated();
  if(!isAuthenticated) {
    return (<div>Not authenticated</div>)
  }

  return (
    <MainLayout>
        <Outlet />
    </MainLayout>
  );
};

export const protectedRoutes = [
  {
    path: "app",
    element: <App />,
    children: [
      { path: "projects/*", element: <ProjectRoutes /> },
      { path: "", element: <Dashboard /> },
    ],
  },
];
