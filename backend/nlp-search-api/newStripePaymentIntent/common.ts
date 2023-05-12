import { Context } from "@azure/functions";

export const createResponse = (
  context: Context,
  status: number,
  body: any,
) => {
  context.res = {
    status,
    body,
  };
};
