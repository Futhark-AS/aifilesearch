import os
import logging
import json
import numpy
import joblib


def init():
    """
    This function is called when the container is initialized/started, typically after create/update of the deployment.
    You can write the logic here to perform init operations like caching the model in memory
    """
    global model
    # AZUREML_MODEL_DIR is an environment variable created during deployment.
    # It is the path to the model folder (./azureml-models/$MODEL_NAME/$VERSION)
    # Please provide your model's folder name if there is one
    model_path = os.path.join(
        os.getenv("AZUREML_MODEL_DIR"), "model/all_lovdata_embedded.csv"
    )
    # deserialize the model file back into a sklearn model
    model = joblib.load(model_path)
    logging.info("Init complete")


def run(raw_data):
    """
    This function is called for every invocation of the endpoint to perform the actual scoring/prediction.
    In the example we extract the data from the json input and call the scikit-learn model's predict()
    method and return the result back
    """
    logging.info("model 2: request received")
    result = [0.5, 0.5]
    logging.info("Request processed")
    # return hardcoded result so that it is easy to validate safe rollout scenario: https://docs.microsoft.com/en-us/azure/machine-learning/how-to-safely-rollout-managed-endpoints
    return result

    # actual scoring logic for reference:
    # data = json.loads(raw_data)["data"]
    # data = numpy.array(data)
    # result = model.predict(data)
    # return result.tolist()