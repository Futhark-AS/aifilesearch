import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  handleError,
  handleGET,
  handleInsupported,
  handlePATCH,
  handlePOST,
  handleResponseSetup,
} from "./src/handling";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const setup = handleResponseSetup(context, req);

  if (setup.success == false) {
    return;
  }

  try {
    switch (req.method) {
      case "GET":
        await handleGET(context, req, setup.cosmos);
        break;
      case "PATCH":
        await handlePATCH(context, req, setup.cosmos);
        break;
      case "POST":
        await handlePOST(context, req, setup.cosmos);
        break;
      default:
        await handleInsupported(context, req, setup.cosmos);
    }
  } catch (error) {
    await handleError(context, req, error);
  }
};

export default httpTrigger;
