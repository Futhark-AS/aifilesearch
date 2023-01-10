const axios = require("axios");

const apiKey = 'd7c72c84-1057-48cb-b52f-d857d4c04380';
//const index_name = "michael"
const project_name = "cb61165"
const environment = "us-west1-gcp"

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
        return {
            ...match,
            metadata: {
                ...match.metadata,
                bounding_box: JSON.parse(match.metadata.bounding_box)
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
  context.log("JavaScript HTTP trigger function processed a request.");


  try{
    // get X-MS-CLIENT-PRINCIPAL-ID and X-MS-CLIENT-PRINCIPAL-NAME headers
    // from request
    const uid = req.headers["x-ms-client-principal-id"];
    //const client_principal_name = req.headers["x-ms-client-principal-name"];




    const document_uid = context.bindings.document.id
    context.log("document_uid: ", document_uid)
    if (document_uid !== uid) {
      context.res = {
        status: 403,
        body: "User not allowed to access this document",
      };
      return;
    }
    allowed_projects = context.bindings.document.projects
    const prompt = req.body.prompt;
    const project = req.body.project;
    const namespace = uid + "/" + project

    context.log("prompt: ", prompt)
    context.log("namespace: ", namespace)
    context.log("Allowed projects for user ", uid, ": ", allowed_projects)

    const topK = req.body.topK;

    // example request body for query
    // {
    //     "prompt": "I am a cat",
    //     "namespace": "example-namespace",
    //     "topK": 10
    // }      


    // format:  
    /*"allowed_namespaces": [
          {
            "namespace": "",
            "index_name": "michael"
        }
    ],*/
    // if namespace not in allowed_namespaces
    // return error
    if (!allowed_projects.some((p) => p.namespace === namespace)) {
      context.res = {
        status: 403,
        body: "Namespace not allowed for user",
      };
      return;
    }

    index_name = allowed_projects.find((p) => p.namespace === namespace).index_name


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

    //context.log(matches)
    const body = JSON.stringify({matches, uid}, { encoding: "utf8" });
    

    context.res = { 
      body
    };
  }
  catch(error){
    context.log.error(error)
    context.res = {
      status: 500,
      body: error,
    };
  }

};
