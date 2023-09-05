const { MilvusClient } = require("@zilliz/milvus2-sdk-node");
const axios = require("axios");

const client = new MilvusClient({
  address: process.env["ENV_MILVUS_ADDRESS"],
  token: process.env["ENV_MILVUS_API_KEY"],
});

const getEmbedding = async (context, text) => {
  const url = "https://api.openai.com/v1/embeddings";
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env["ENV_OPENAI_API_KEY"],
  };
  const data = {
    input: text,
    model: "text-embedding-ada-002",
  };
  const response = await axios.post(url, data, { headers });
  context.log("Usage: ", response.data.usage);
  return response.data.data[0].embedding;
};

// {
//   status: { error_code: 'Success', reason: '', code: 0 },
//   results: [
//     { score: 0, id: '513', word_count: '3' },
//     { score: 6.3357133865356445, id: '562', word_count: '1' }
// ...
//   ]
// }
const query = async (collection, vector, output_fields, limit, namespace) => {
  const res = await client.search({
    collection_name: collection,
    vector: vector,
    output_fields: output_fields,
    limit: limit,
    filter: `metadata["namespace"] == "${namespace}"`,
  });

  if (res.status.error_code !== "Success") {
    console.error(
      "Could not query milvus index: ",
      res.status.error_code,
      res.status.reason
    );
  }

  return res.results;
};

module.exports = async function (context, req, document) {
  await context.log("JavaScript HTTP trigger function processed a request.");

  try {
    const uid = req.headers["x-ms-client-principal-id"];
    const price = (0.0004 * 8000) / 1000;
    const price_credits = process.env["ENV_DOLLAR_TO_CREDIT"] * price;

    if (context.bindings.document.credits < price_credits) {
      context.res = {
        status: 402,
        body: "Not enough credits",
      };
      return;
    }

    const projects = context.bindings.document.projects;
    const prompt = req.body.prompt;
    const project = req.body.project;
    const namespace = uid + "/" + project;

    context.log("prompt: ", prompt);
    context.log("namespace: ", namespace);
    context.log("Allowed projects for user ", uid, ": ", projects);

    const topK = req.body.topK;

    if (!projects.some((p) => p.namespace === namespace)) {
      context.res = {
        status: 403,
        body: "Namespace not allowed for user",
      };
      return;
    }

    const vector = await getEmbedding(context, prompt);

    if (!vector) {
      context.res = {
        status: 500,
        body: "Error getting embedding",
      };
      return;
    }

    const collection = "aifilesearch";
    const matches = await query(
      collection,
      vector,
      ["metadata"],
      topK,
      namespace
    );

    if (!matches) {
      context.res = {
        status: 500,
        body: "Error querying index",
      };
      return;
    }

    const body = JSON.stringify({ matches }, { encoding: "utf8" });
    context.bindings.document.credits -= price_credits;
    context.bindings.outputDocument = context.bindings.document;

    context.res = {
      body,
    };
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: {
        message: "An internal error occurred",
      },
    };
  }
};
