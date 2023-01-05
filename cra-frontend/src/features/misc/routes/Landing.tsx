import { useIsAuthenticated, useUser } from "@/app/hooks";
import { Button, Divider } from "@mantine/core";
import React from "react";
import { Link } from "react-router-dom";
import { PlainNavbar } from "../components";

export const Landing = () => {
  const isAuthenticated = useIsAuthenticated();
  const { firstName } = useUser();

  return (
    <main className="container mx-auto flex min-h-screen w-full flex-col p-4 md:w-[70ch]">
    <PlainNavbar />

      <h1 className="mt-8 text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
      DocuSearch
      </h1>

      <p className="w-full">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora
        quisquam explicabo modi enim quaerat mollitia similique a reiciendis
        laborum, recusandae sit nam distinctio illum culpa ducimus qui odit quam
        natus? Consequuntur harum ab optio eligendi in qui, sunt repellat
        placeat magnam, repudiandae nesciunt quidem corrupti velit, eius
        doloribus saepe beatae.
      </p>
      <Divider className="my-5" />
      {isAuthenticated ? (
        <section>
          <h4 className="my-5 text-2xl">Welcome {firstName}!</h4>
          <Button variant="outline" className="block">
            <Link to={"/projects"}>Your projects</Link>
          </Button>
        </section>
      ) : (
        <Link to={"/auth"}>
          <Button variant="outline">Get started!</Button>
        </Link>
      )}
    </main>
  );
};
