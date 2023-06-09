import { Context, HttpRequest } from "@azure/functions";
import { userSchema } from "./DBUserSchema";
import {
  createErrorResponse,
  createResponse,
  extractReqHeaderUID,
  ErrorResponse,
  zodError,
  notifyOfEvent,
} from "./common";
import { CosmosWrapper } from "./cosmos";
import { USER_STARTING_CREDITS } from "./constants";

export const handleGET = async (
  context: Context,
  req: HttpRequest,
  cosmos: CosmosWrapper
) => {
  const uid = extractReqHeaderUID(req);
  if (!uid) {
    createErrorResponse(context, ErrorResponse.Unauthorized, "Unauthorized");
    return;
  }

  const dbResponse = await cosmos.readById(uid);

  if (dbResponse.success == false) {
    createErrorResponse(
      context,
      ErrorResponse.DatabaseError,
      "Database error",
      dbResponse.error
    );
    return;
  }

  if (dbResponse.data == null) {
    createErrorResponse(context, ErrorResponse.NotFound, "User not found");
    return;
  }

  const dbUser = dbResponse.data;

  const userParsed = userSchema.safeParse(dbUser);
  if (userParsed.success == false) {
    createErrorResponse(
      context,
      ErrorResponse.DatabaseError,
      "Database error",
      zodError(userParsed.error, dbResponse)
    );
    return;
  }

  createResponse(context, 200, userParsed.data);
};

export const handlePATCH = async (
  context: Context,
  req: HttpRequest,
  cosmos: CosmosWrapper
) => {
  const uid = extractReqHeaderUID(req);
  if (!uid) {
    createResponse(context, 401, "Unauthorized");
    context.log("Rquest header does not contain auth header.");
    return;
  }

  const reqBodyParsed = userSchema.deepPartial().strict().safeParse(req.body);

  if (reqBodyParsed.success == false) {
    createErrorResponse(
      context,
      400,
      "Request body is not valid. ",
      zodError(reqBodyParsed.error, req.body)
    );
    return;
  }

  const incomingUser = reqBodyParsed.data;

  // Prevent user from updating credits
  if (incomingUser.credits) {
    delete incomingUser.credits;
  }

  const dbUserResp = await cosmos.readById(uid);

  if (dbUserResp.success == false) {
    createErrorResponse(context, 500, "Database error", dbUserResp.error);
    return;
  }

  if (dbUserResp.data == null) {
    createResponse(context, 404, "User document not found. UID:" + uid);
    return;
  }

  const dbUser = dbUserResp.data;

  const newObject = Object.assign({}, dbUser, incomingUser);

  const resp = await cosmos.updateById(uid, newObject);

  if (resp.success == false) {
    createErrorResponse(context, 500, "Database error", resp.error);
    return;
  }

  createResponse(context, 200, resp.data);
};

export const handlePOST = async (
  context: Context,
  req: HttpRequest,
  cosmos: CosmosWrapper
) => {
  const reqBody = userSchema.partial().safeParse(req.body);

  if (reqBody.success == false) {
    createErrorResponse(
      context,
      400,
      "Request body is not valid.",
      zodError(reqBody.error, req.body)
    );
    return;
  }

  const user = reqBody.data;

  // Set start credits and projects
  user.credits = USER_STARTING_CREDITS
  user.projects = [];
  user.id = extractReqHeaderUID(req);

  const dbUserResp = await cosmos.insert(user);

  if (dbUserResp.success == false) {
    createErrorResponse(context, 500, "Database error", dbUserResp.error);
    return;
  }

  createResponse(context, 200, dbUserResp.data);

  notifyOfEvent(["Signed up new user: " + user.name + ", " + user.email])
};

export const handleInsupported = async (
  context: Context,
  req: HttpRequest,
  cosmos: CosmosWrapper
) => {
  createResponse(context, 405, "Method not supported" + req.method);
};

export const handleError = async (
  context: Context,
  req: HttpRequest,
  error: any
) => {
  const err = JSON.stringify(
    Object.assign({}, error, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
  );

  createErrorResponse(context, 500, "Internal error", err);
};

export const handleResponseSetup = (
  context: Context,
  req: HttpRequest
):
  | {
      success: true;
      cosmos: CosmosWrapper;
    }
  | {
      success: false;
    } => {
  const cosmosEndpoint = "https://nlpcosmos.documents.azure.com:443/";
  const cosmosKey = process.env["ENV_COSMOS_KEY"];

  if (!cosmosKey) {
    handleError(context, req, { message: "Cosmos key is not set in env" });
    return { success: false };
  }

  const cosmos = new CosmosWrapper({
    cosmosEndpoint,
    cosmosKey,
    dbName: "nlp-search",
    containerName: "users",
  });

  return {
    success: true,
    cosmos,
  };
};
