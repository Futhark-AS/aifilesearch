import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { z } from "zod";
import { createResponse } from "./common";
import { CosmosClient } from "@azure/cosmos";

// "files": [
//   {
//       "blob_name": "sid:53dc3748787d48b74d937ec95256a515/ekte-prosjekt/3d modelling.pdf",
//       "price": 0.15,
//       "credits": 1,
//       "num_pages": 20,
//       "file_name": "3d modelling.pdf"
//   }

const documentSchema = z.object({
  id: z.string(),
  credits: z.number(),
  email: z.string().optional(),
  name: z.string().optional(),
  projects: z.array(
    z.object({
      namespace: z.string(),
      index_name: z.string(),
      cost: z.number(),
      files: z.array(
        z.object({
          blob_name: z.string(),
          price: z.number(),
          credits: z.number(),
          num_pages: z.number(),
          file_name: z.string(),
        })
      ),
    })
  ),
});

type Document = z.infer<typeof documentSchema>;

const cosmosEndpoint = "https://nlpcosmos.documents.azure.com:443/";
const cosmosKey = process.env["ENV_COSMOS_KEY"];

const client = new CosmosClient({ endpoint: cosmosEndpoint, key: cosmosKey });
const db = client.database("nlp-search");
const container = db.container("users");

const readById = async (id: string) => {
  const response = await container.item(id, id).read();
  return response.resource;
};

const updateById = async (id: string, body: any) => {
  const response = await container.item(id, id).replace(body);
  return response.resource;
};

const insert = async (body: any) => {
  const response = await container.items.create(body);
  return response.resource;
};

const extractReqHeaderUID = (req: HttpRequest) =>
  req.headers["x-ms-client-principal-id"];

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");
  const uid = extractReqHeaderUID(req);

  if (!uid) {
    createResponse(
      context,
      400,
      "Request must contain header: x-ms-client-principal-id"
    );
    return;
  }

  try {
    switch (req.method) {
      case "GET":
        let doc: Document;
        try {
          const _docRaw = await readById(uid);
          const _docParsed = documentSchema.safeParse(_docRaw);

          if (_docParsed.success == false) {
            createResponse(
              context,
              500,
              "User document is not valid. Error:" + _docParsed.error.toString()
            );
            return;
          }
          doc = _docParsed.data;
        } catch (error) {
          createResponse(
            context,
            500,
            "An internal server error occured. Error:" + error.toString()
          );
          return;
        }
        createResponse(context, 200, doc);
        break;
      case "PATCH":
        const body = documentSchema.deepPartial().parse(req.body);

        // Remove credit field from body if it exists
        if (body.credits) {
          delete body.credits;
        }

        const newObject = Object.assign({}, doc, body);
        updateById(uid, newObject);
        createResponse(context, 200, newObject);
        break;
      case "POST":
        const body2 = documentSchema.partial().parse(req.body);
        // Remove credit field from body if it exists
        
        body2.credits = 0;
        body2.projects = []

        const inserted = await insert(body2);
        createResponse(context, 200, inserted);
      default:
        createResponse(context, 405, "Method not supported" + req.method);
        break;
    }
  } catch (error) {
    const err = JSON.stringify(
      Object.assign({}, error, {
        // Explicitly pull Error's non-enumerable properties
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    );

    createResponse(
      context,
      500,
      "An internal server error occured. Error:" + err
    );
  }
};

export default httpTrigger;
