import os
import logging
import pandas as pd
import numpy as np
import openai
import json
from openai.embeddings_utils import get_embedding, cosine_similarity
openai.api_key = "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"
# primkey = nmiv4f6MgA78R47rstmgbWTYstV3nix2

def init():
    """
    This function is called when the container is initialized/started, typically after create/update of the deployment.
    You can write the logic here to perform init operations like caching the model in memory
    """
    global df
    # AZUREML_MODEL_DIR is an environment variable created during deployment.
    # It is the path to the model folder (./azureml-models/$MODEL_NAME/$VERSION)
    # Please provide your model's folder name if there is one
    model_path = os.path.join(
        os.getenv("AZUREML_MODEL_DIR"), "model/all_lovdata_embedded.csv"
    )
    # deserialize the model file back into a sklearn model

    df = pd.read_csv(model_path, index_col=0)
    df["ada_search"] = df.ada_search.apply(lambda x: np.fromstring(x[1:-1], sep=","))

def run(raw_data):
    """
    This function is called for every invocation of the endpoint to perform the actual scoring/prediction.
    In the example we extract the data from the json input and call the scikit-learn model's predict()
    method and return the result back
    """
    logging.info("model 1: request received")
    logging.info("PRINT raw data: " + raw_data)
    prompt = json.loads(raw_data)["prompt"]
    logging.info("PRINT prompt: " + prompt)
    embedding = get_embedding(
        prompt,
        engine="text-embedding-ada-002"
    )
    logging.info("embedding: OK")
    
    df["similarities"] = df.ada_search.apply(lambda x: cosine_similarity(x, embedding))
    logging.info("similarities: OK")
    
    res = (
        df.sort_values("similarities", ascending=False)
    )
    logging.info("sort: OK")
    res = res[["similarities", "law_name", "chapter", "paragraph_title", "paragraph"]]
    logging.info("RESULTAT: " + "res.head(10)")
    json_res = res.head(10).to_json()
    logging.info("json_res: OK")

    return  json_res
