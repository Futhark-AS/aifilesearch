import React from "react";
import { RouteObject } from "react-router-dom";
import Project from "./Project";
import Projects from "./Projects";

export const ProjectRoutes: RouteObject[] = [
  { index: true, element: <Projects /> },
  { path: ":id", element: <Project /> },
];
