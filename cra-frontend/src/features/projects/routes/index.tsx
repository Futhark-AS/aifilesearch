import React from "react";
import { Route, Routes } from 'react-router-dom';
import Projects from "./Projects";
import Project from "./Project";
import EditProject from "./EditProject";

export const ProjectRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Projects />} />
      <Route path=":id" element={<Project />} />
      <Route path=":id/edit" element={<EditProject />} />
    </Routes>
  );
};
