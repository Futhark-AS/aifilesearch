import { useIsAuthenticated, useUser } from "@/app/hooks";
import { Button, Divider } from "@mantine/core";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlainNavbar } from "../components";
import { useEffect } from "react";

export const Landing = () => {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    isAuthenticated && navigate("app");
  }, [isAuthenticated, navigate]);

  return (
    <main className="container mx-auto flex min-h-screen w-full flex-col p-4 md:w-[70ch]">
      <PlainNavbar />

      <h1 className="mt-8 text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
        DocuSearch
      </h1>

      <p className="w-full">
        Are you tired of sifting through countless folders and documents, trying
        to find a specific piece of information? Our website simplifies the
        search process by allowing you to use natural language queries to find
        what you are looking for. Simply upload your files and let our advanced
        search algorithm do the rest. Say goodbye to endless scrolling and hello
        to efficient, accurate results with{" "}
        <span className="text-lg font-semibold">DocuSearch</span>
      </p>
      <Divider className="my-5" />
      <Link to={"/auth"}>
        <Button variant="outline">Get started!</Button>
      </Link>
    </main>
  );
};
