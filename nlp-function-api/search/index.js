const axios = require("axios");

const apiKey = 'd7c72c84-1057-48cb-b52f-d857d4c04380';
//const index_name = "michael"
const project_name = "cb61165"
const environment = "us-west1-gcp"

const baseUrl = (index_name, project_name, environment) => `https://${index_name}-${project_name}.svc.${environment}.pinecone.io/`

const request = async (method, path, body, index_name, project_name, environment) => {
  console.log("request", method, path, body, index_name, project_name, environment)
  const url = baseUrl(index_name, project_name, environment) + path;
  const headers = {
    'Content-Type': 'application/json',
    'Api-Key': apiKey,
  };
  try {
    const response = await axios({
      url, method, data:body, headers
    });
    // if response 2xx return data
    if(response.status >= 200 && response.status < 300){
      return response.data;
    }
  } catch (error) {
    throw new Error(error);
  }
};



// body has this format:
/*
{
     "includeValues": "false",
     "includeMetadata": true,
     "vector": [
          1,
          2,
          3,
          ...
     ],
     "namespace": "example-namespace",
     "topK": 10
}
*/
//url = /query
const query = async (namespace, vector, topK, index_name, project_name, environment) => {
    const body = {
        namespace,
        vector,
        topK,
        includeMetadata: true,
        // filter: {
        //     content: {
        //         $ne: "1"
        //   }
        // }
    };
    const res = await request('POST', 'query', body, index_name, project_name, environment);
    const matches = res.matches;
    return matches;
}

// describe index stats
// url : describe_index_stats
const describeIndexStats = async (index_name, project_name, environment) => {
    return request('POST', 'describe_index_stats', {}, index_name, project_name, environment);
}


const getEmbedding = async (text) => {
  const url = "https://api.openai.com/v1/embeddings";
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer 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",
  };
  const data = {
    input: text,
    model: "text-embedding-ada-002",
  };
  try {
    const response = await axios.post(url, data, { headers });
    console.log("Usage: ", response.data.usage);
    return response.data.data[0].embedding;
  } catch (error) {
    throw new Error(error);
  }
};




module.exports = async function (context, req, document) {
  context.log("JavaScript HTTP trigger function processed a request.");

  // get X-MS-CLIENT-PRINCIPAL-ID and X-MS-CLIENT-PRINCIPAL-NAME headers
  // from request
  const uid = req.headers["x-ms-client-principal-id"];
  //const client_principal_name = req.headers["x-ms-client-principal-name"];


  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    context.res = {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With, X-ZUMO-AUTH",
      },
    };
    return;
  }

  const document_uid = context.bindings.document.id
  if (document_uid !== uid) {
    context.res = {
      status: 403,
      body: "User not allowed to access this document",
    };
    return;
  }

  allowed_namespaces = context.bindings.document.allowed_namespaces
  const prompt = req.query.prompt;
  let namespace = req.query.namespace;
  if(!namespace){
    namespace = ""
  }

  const topK = req.query.topK;


  // format:  
  /*"allowed_namespaces": [
        {
          "namespace": "",
          "index_name": "michael"
      }
  ],*/
  // if namespace not in allowed_namespaces
  // return error
  if (!allowed_namespaces.some((ns) => ns.namespace === namespace)) {
    context.res = {
      status: 403,
      body: "Namespace not allowed for user",
    };
    return;
  }

  index_name = allowed_namespaces.find((ns) => ns.namespace === namespace).index_name


  const vector = await getEmbedding(prompt);
  const matches = await query(namespace, vector, topK, index_name, project_name, environment);
  //context.log(matches)
  const body = JSON.stringify({matches, uid}, { encoding: "utf8" });

  const res = {
    // status: 200, /* Defaults to 200 */
    body: body,
    // allow CORS
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
    },
  };

  context.log(res);

  context.res = res;
};
