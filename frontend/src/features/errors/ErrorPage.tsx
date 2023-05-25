import React, { useMemo } from "react";
import { useRouteError } from "react-router-dom";
import { z } from "zod";
import { Error } from "./ShowError";

const errorSchema = z.object({
  statusText: z.string().optional(),
  message: z.string().optional(),
  type: z.string().optional(),
  status: z.number().optional(),
});

export type PageError = z.infer<typeof errorSchema>;

export function ErrorPage() {
  const error = useRouteError();

  const parsedError = useMemo(() => errorSchema.safeParse(error), [error]);
  console.error(error);

  return (
    <div className="flex h-full items-center p-16">
      <Error error={parsedError.success ? parsedError.data : {}} />
    </div>
  );
}
