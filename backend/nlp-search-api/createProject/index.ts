import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
  document: any
): Promise<void> {
  context.log("HTTP trigger function processed a request.");

  const newProjectName = req.body?.projectName;

  if (!newProjectName) {
    context.res = {
      status: 400,
      body: "Request body must contain: projectName",
    };
    return;
  }

  if (!document) {
    context.res = {
      status: 400,
      body: "No projects found for user",
    };
    return;
  }

  try {
    const uid = req.headers["x-ms-client-principal-id"];

    if (document.id !== uid) {
      context.res = {
        status: 403,
        body: "User not allowed to access this document",
      };
      return;
    }

    const newProject = {
      namespace: uid + "/" + newProjectName,
      index_name: newProjectName,
      cost: 0,
      files: [],
    };

    const newDocument = {
      ...document,
      projects: [...document.projects, newProject],
    };

    context.bindings.outputDocument = JSON.stringify(newDocument);

    const responseMessage = {
      status: 200,
      body: { projects: newDocument.projects, uid: uid },
    };

    context.res = responseMessage;
  } catch (error) {
    const err = JSON.stringify(
      Object.assign({}, error, {
        // Explicitly pull Error's non-enumerable properties
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    );

    context.res = {
      status: 500,
      body: "An error occurred while getting projects",
      error: err,
    };
  }
};

export default httpTrigger;
