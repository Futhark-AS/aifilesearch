import React, { useMemo } from "react";
import { useRouteError } from "react-router-dom";
import { z } from "zod";

const errorSchema = z.object({
  statusText: z.string().optional(),
  message: z.string().optional(),
});

export function ErrorPage() {
  const error = useRouteError();

  const parsedError = useMemo(() => errorSchema.safeParse(error), [error]);
  console.error(error);

  return (
    <div>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>
          {parsedError.success
            ? parsedError.data.statusText ||
              parsedError.data.message ||
              "Unknown error"
            : "Unknown error"}
        </i>
      </p>
    </div>
  );
}
