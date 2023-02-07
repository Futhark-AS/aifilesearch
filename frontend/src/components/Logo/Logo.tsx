import React from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center text-white">
      <img className="h-8 w-auto mr-2" src={logo} alt="Logo" />
      <span className="text-xl font-semibold text-white">AI Search</span>
    </Link>
  );
};
