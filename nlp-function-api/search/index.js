// import openai embedding
// const { OpenAI } = require("openai-api");
//const openai = new OpenAI(process.env.OPENAI_API_KEY);

/* const get_embedding = async (query) => {
  // POST https://api.openai.com/v1/embeddings
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-embedding-ada-002",
      input: query,
    }),
  });
  /* response format: {
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [
        0.0023064255,
        -0.009327292,
        .... (1056 floats total for ada)
        -0.0028842222,
      ],
      "index": 0
    }
  ],
  "model": "text-embedding-ada-002",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}
  const data = await response.json();
  return data.data[0].embedding;
}; 
*/
const axios = require("axios");
const apiKey = "nmiv4f6MgA78R47rstmgbWTYstV3nix2";

module.exports = async function (context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  const prompt = req.body && req.body.prompt;

  const data = { prompt: prompt };

  const body = JSON.stringify(data);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "azureml-model-deployment": "blue",
  };

  const url =
    "https://lovdata-endpoint-1.northeurope.inference.ml.azure.com/score";
  /* const embedding = await get_embedding(prompt); */

  // connect to the azure ml blue endpoint

  /*   const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: body,
  }); */

  const response = await axios.post(url, body, {
    headers: headers,
  });

  const res = {
    // status: 200, /* Defaults to 200 */
    body: JSON.parse(response.data, { encoding: "utf8" }),
  };

  context.log(res);

  context.res = res;
};
