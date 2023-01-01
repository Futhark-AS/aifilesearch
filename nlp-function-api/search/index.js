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

  const prompt = req.body && req.body.prompt;
  const namespace = req.body && req.body.namespace;
  const topK = req.body && req.body.topK;

  //TODO: check with database if index_name allowed for user
  context.log("ID", context.bindings.document.id)
  allowed_namespaces = context.bindings.document.allowed_namespaces
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

  const res = {
    // status: 200, /* Defaults to 200 */
    body: JSON.stringify(matches, { encoding: "utf8" }),
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
