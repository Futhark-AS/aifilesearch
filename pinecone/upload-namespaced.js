const apiKey = 'd7c72c84-1057-48cb-b52f-d857d4c04380';
const index_name = "michael"
const project_name = "cb61165"
const environment = "us-west1-gcp"

const baseUrl = (index_name, project_name, environment) => `https://${index_name}-${project_name}.svc.${environment}.pinecone.io/`

const request = async (method, path, body, index_name, project_name, environment) => {
    const url = baseUrl(index_name, project_name, environment) + path;
    const headers = {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
    };
    const options = {
        method,
        headers,
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    return fetch(url, options).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    });
}

// body has this format: 
/*
{
 "vectors": [
          {
               "values": [
                    "1,2,3"
               ],
               "metadata": {
                    "newKey": "New Value"
               },
               "id": "1"
          }
     ],
      "namespace": "heihei"
}
*/
const upsert = async (namespace, vectors, index_name, project_name, environment) => {
    const body = {
        namespace,
        vectors,
    };
    return request('POST', 'vectors/upsert', body, index_name, project_name, environment);
}


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
    };
    const res = await request('POST', 'query', body, index_name, project_name, environment);
    const matches = res.matches;
    // map matches to a list of score and metadata.text
    return matches.map((match) => {
        return {
            score: match.score,
            text: match.metadata.text,
        };
    });
}

// describe index stats
// url : describe_index_stats
const describeIndexStats = async (index_name, project_name, environment) => {
    return request('POST', 'describe_index_stats', {}, index_name, project_name, environment);
}


const getEmbedding = async (text) => {
    // curl looks like this:
    /*
    curl https://api.openai.com/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"input": "Your text string goes here",
       "model":"text-embedding-ada-002"}'
    */

    /*
    Response looks like this:
    {
  "data": [
    {
      "embedding": [
        -0.006929283495992422,
        -0.005336422007530928,
        ...
        -4.547132266452536e-05,
        -0.024047505110502243
      ],
      "index": 0,
      "object": "embedding"
    }
  ],
  "model": "text-embedding-ada-002",
  "object": "list",
  "usage": {
    "prompt_tokens": 5,
    "total_tokens": 5
  }
}
    */
    const url = "https://api.openai.com/v1/embeddings"
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
    }
    const body = {
        "input": text,
        "model": "text-embedding-ada-002"
    }
    const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    }
    const response = await fetch(url, options)

    if (response.ok) {
        const json = await response.json()
        // print the usage
        console.log("Usage: ", json.usage)
        return json.data[0].embedding
    }
    throw new Error(response.statusText);
}
const main = async () => {
    const namespace = ""

    const text = "What are the different types of competitive advantage?"

    // use openai api to get the embedding
    const embedding = await getEmbedding(text)

    // query the index
    const topK = 5
    const results = await query(namespace, embedding, topK, index_name, project_name, environment)

    // print the results
    console.log(results)
}

main()