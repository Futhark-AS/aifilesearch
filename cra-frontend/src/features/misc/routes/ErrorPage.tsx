import React, { useMemo } from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import { z } from "zod";
import { Button } from '../../../components/Button/Button';

const errorSchema = z.object({
  statusText: z.string().optional(),
  message: z.string().optional(),
});

export function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();

  const parsedError = useMemo(() => errorSchema.safeParse(error), [error]);
  console.error(error);

  return (
    <div className="flex h-full items-center p-16">
      <div className="container mx-auto my-8 flex flex-col items-center justify-center px-5">
        <div className="max-w-md text-center">
          <h2 className="mb-8 text-9xl font-extrabold dark:text-gray-600">
            <span className="sr-only">Error</span>404
          </h2>
          <p className="text-2xl font-semibold md:text-3xl">
            Sorry, we could not find this page.
          </p>
          <p className="mt-4 mb-8 dark:text-gray-400">
            But dont worry, you can find plenty of other things on our homepage.
          </p>
          <p className="mt-4 mb-8 dark:text-gray-400">
            {(parsedError.success &&
              (parsedError.data.statusText || parsedError.data.message)) ||
              "Unknown error"}
          </p>
          <Button
            className="rounded px-8 py-3 font-semibold mx-auto"
            onClick={() => navigate(-1)}
          >
          Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
