import { Context, HttpRequest } from "@azure/functions";

export const createResponse = (context: Context, status: number, body: any) => {
  context.res = {
    status,
    body,
  };
};

export const ErrorResponse = {
  DatabaseError: 500,
  UserError: 400,
  Unauthorized: 401,
  NotFound: 404,
  Unsupported: 405,
  InternalError: 500,
} as const;

type ErrorResponseValues = (typeof ErrorResponse)[keyof typeof ErrorResponse];

export const createErrorResponse = (
  context: Context,
  status: ErrorResponseValues,
  message: string,
  error?: any
) => {
  const body = {
    message,
  };
  if (error) {
    body["error"] = error;
  }
  createResponse(context, status, body);
  context.log(message, error);
  // if stack on error, log it
  if (error?.stack) {
    context.log(error.stack);
  }
};

export const extractReqHeaderUID = (req: HttpRequest) =>
  req.headers["x-ms-client-principal-id"];

export const zodError = (zodError, rawObject) => {
  return {
    ...zodError,
    rawObject: rawObject,
  };
};

export const notifyOfEvent = async (messages: string[]) => {
  const url = process.env["ENV_NOTIFY_URL_ENDPOINT"];
  if (!url) {
    return;
  }
  fetch(url, {
    method: "POST",
    body: JSON.stringify({
      to: process.env["ENV_NOTIFIER_DESTINATION"],
      messages,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};
