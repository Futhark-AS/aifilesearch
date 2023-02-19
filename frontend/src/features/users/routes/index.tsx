import React from "react";
import { RouteObject } from "react-router-dom";
import { Profile } from "./Profile";

export const UserRoutes: RouteObject[] = [
  { index: true, element: <Profile /> },
];
