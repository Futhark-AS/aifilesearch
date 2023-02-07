import React from "react";
import { PageError } from "./ErrorPage";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button"

interface Props {
  error: PageError;
}

export const ShowError = ({ error }: Props) => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto my-8 flex flex-col items-center justify-center px-5">
      <div className="max-w-md text-center">
        <h2 className="mb-8  dark:text-gray-600">
          <div className="text-9xl font-extrabold">Error </div>
          <div className="text-5xl font-semibold">{error.status}</div>
        </h2>
        <p className="text-2xl font-semibold md:text-3xl">
          Sorry, there was an error loading this page.
        </p>
        <p className="mt-4 mb-8 dark:text-gray-400">
          {error.statusText || error.message || "Unknown error"}
        </p>
        <Button
          className="mx-auto rounded px-8 py-3 font-semibold"
          onClick={() => navigate(-1)}
        >
          Go back
        </Button>
      </div>
    </div>
  );
};
