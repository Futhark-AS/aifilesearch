import React from "react";
import { RouteObject } from "react-router-dom";
import Project from "./Project";
import ProjectData from "./ProjectData";
import Projects from "./Projects";
// export const ProjectRoutes = () => {
//   return (
//     <Routes>
//       <Route path="" element={<Projects />} />
//       <Route path=":id" element={<Project />} />
//       <Route path=":id/files" element={<ProjectData />} />
//     </Routes>
//   );
// };

export const ProjectRoutes: RouteObject[] = [
  { index: true, element: <Projects /> },
  { path: ":id", element: <Project /> },
  { path: ":id/files", element: <ProjectData /> },
];
