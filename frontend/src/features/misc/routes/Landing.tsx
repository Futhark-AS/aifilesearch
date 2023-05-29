import { Button } from "@/components/Button";
import storage from "@/utils/storage";
import { Divider } from "@mantine/core";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlainNavbar } from "../components";

export const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = storage.getAzureToken();

    if (!(token == null || token == "")) {
      navigate("app");
    }
  }, [navigate]);

  return (
    <main className="container mx-auto flex min-h-screen w-full flex-col p-4 md:w-[70ch]">
      <PlainNavbar />

      <h1 className="mt-8 text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
        AIFileSearch
      </h1>

      <p className="w-full">
        Are you tired of sifting through countless folders and documents, trying
        to find a specific piece of information? Our website simplifies the
        search process by allowing you to use natural language queries to find
        what you are looking for. Simply upload your files and let our advanced
        search algorithm do the rest. Say goodbye to endless scrolling and hello
        to efficient, accurate results with{" "}
        <span className="text-lg font-semibold">AIFileSearch</span>
      </p>
      <Divider className="my-5" />
      <Link to={"/auth"}>
        <Button>Get started!</Button>
      </Link>
    </main>
  );
};
