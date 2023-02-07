import React from "react";
import { Route, Routes } from 'react-router-dom';
import Authenticate from "./Authenticate";

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Authenticate />} />
    </Routes>
  );
};
