import { z } from "zod";
import { createResponse } from "./common";
import { CosmosClient } from "@azure/cosmos";

const documentSchema = z.object({
  id: z.string(),
  credits: z.number(),
  projects: z.array(
    z.object({
      namespace: z.string(),
      index_name: z.string(),
      cost: z.number(),
      files: z.array(z.string()),
    })
  ),
});

type Document = z.infer<typeof documentSchema>;

const cosmosEndpoint = "https://nlpcosmos.documents.azure.com:443/";
const cosmosKey = "P1Y0MkLcemQU8KP9U5u3HcRctLwW689Lu9XPksrerixwEgbjGvJMG8VHKw0tpgSQxbGlvi1q4K67ACDbl9KZ8Q=="

const client = new CosmosClient({ endpoint: cosmosEndpoint, key: cosmosKey });
const db = client.database("nlp-search");
const container = db.container("users");

const readById = async (id: string) => {
  const response = await container.item(id, id).read();
  return response.resource
};

const updateById = async (id: string, body: any) => {
  const response = await container.item(id, id).replace(body);
  return response.item;
};

const insert = async (body: any) => {
  const response = await container.items.create(body);
  return response.resource;
};

async function main() {
  

  let doc: Document;
  try {
    const _docRaw = await readById("sid:eb29ffbd4835f17f59814309696889de");
    const _docParsed = documentSchema.safeParse(_docRaw);

    if (_docParsed.success == false) {
      console.log("Error parsing document");
      return;
    }
    doc = _docParsed.data;
  } catch (error) {
    console.log("Error parsing document");
    return;
  }

  console.log("Document read successfully");

  console.log(doc);
}

main();
