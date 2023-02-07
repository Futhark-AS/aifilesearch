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
          label: "Log in",
          link: "/auth",
        },
      ]}
    />
  );
}
