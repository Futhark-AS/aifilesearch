const axios = require("axios");

const apiKey = '4af86256-76e3-4317-9343-964fb445a00a';
//const index_name = "michael"
const project_name = "72e7a0d"
const environment = "us-east1-gcp"

const baseUrl = (index_name, project_name, environment) => `https://${index_name}-${project_name}.svc.${environment}.pinecone.io/`

const request = async (method, path, body, index_name, project_name, environment) => {
  const url = baseUrl(index_name, project_name, environment) + path;
  const headers = {
    'Content-Type': 'application/json',
    'Api-Key': apiKey,
  };
  const response = await axios({
    url, method, data:body, headers
  });
  // if response 2xx return data
  if(response.status >= 200 && response.status < 300){
    return response.data;
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
  
    //.log(res.matches);
    // transform each match.bounding_box into json object
    const matches = res.matches.map(match => {
      //blob_name = match.metadata.file_name.split("/")
        return {
            ...match,
            metadata: {
                ...match.metadata,
                bounding_box: JSON.parse(match.metadata.bounding_box),
                //file_name: blob_name[blob_name.length - 1]
            }
        }
    });
    return matches;
}

// describe index stats
// url : describe_index_stats
const describeIndexStats = async (index_name, project_name, environment) => {
    return request('POST', 'describe_index_stats', {}, index_name, project_name, environment);
}


const getEmbedding = async (context, text) => {
  const url = "https://api.openai.com/v1/embeddings";
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer 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",
  };
  const data = {
    input: text,
    model: "text-embedding-ada-002",
  };
  const response = await axios.post(url, data, { headers });
  context.log("Usage: ", response.data.usage);
  return response.data.data[0].embedding;
};




module.exports = async function (context, req, document) {
  await context.log("JavaScript HTTP trigger function processed a request.");


  try{
    // get X-MS-CLIENT-PRINCIPAL-ID and X-MS-CLIENT-PRINCIPAL-NAME headers
    // from request
    const uid = req.headers["x-ms-client-principal-id"];
    //const client_principal_name = req.headers["x-ms-client-principal-name"];


    const projects = context.bindings.document.projects
    const prompt = req.body.prompt;
    const project = req.body.project;
    const namespace = uid + "/" + project

    context.log("prompt: ", prompt)
    context.log("namespace: ", namespace)
    context.log("Allowed projects for user ", uid, ": ", projects)

    const topK = req.body.topK;

    // if namespace not in allowed_namespaces
    // return error
    if (!projects.some((p) => p.namespace === namespace)) {
      context.res = {
        status: 403,
        body: "Namespace not allowed for user",
      };
      return;
    }

    index_name = projects.find((p) => p.namespace === namespace).index_name


    const vector = await getEmbedding(context, prompt);
    if(!vector){
      context.res = {
        status: 500,
        body: "Error getting embedding",
      };
      return;
    }

    const matches = await query(namespace, vector, topK, index_name, project_name, environment);
    if(!matches){
      context.res = {
        status: 500,
        body: "Error querying index",
      };
      return;
    }

    const body = JSON.stringify({matches}, { encoding: "utf8" });
    

    context.res = { 
      body
    };
  }
  catch(error){
    context.log.error(error)
    context.res = {
      status: 500,
      body: {
        message: "An internal error occurred"
      }
    };
  }

};
