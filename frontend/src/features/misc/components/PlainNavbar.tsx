import React from "react";
import { Navbar } from "@/components/Navbar";

export function PlainNavbar() {
  return (
    <Navbar
      links={[
        {
          label: "About",
          link: "/about",
        },
        {
          label: "Go to app",
          link: "/auth",
        },
      ]}
    />
  );
}
