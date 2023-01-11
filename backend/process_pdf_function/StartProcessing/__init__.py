# This function is not intended to be invoked directly. Instead it will be
# triggered by an HTTP starter function.
# Before running this sample, please:
# - create a Durable activity function (default name is "Hello")
# - create a Durable HTTP starter function
# - add azure-functions-durable to requirements.txt
# - run pip install -r requirements.txt

import logging
import json

import azure.functions as func
import azure.durable_functions as df

from azure.storage.blob import BlobServiceClient

# Retrieve the connection string for use with the application. The storage
connect_str = "DefaultEndpointsProtocol=https;AccountName=nlpsearchapi;AccountKey=E3hMExwQh1j50yYeW/KUA5tPkZLf0VwEu3/jlz7NRGgCmElfjpiBbnTRN5LxrN77warRvknuP9bM+AStWj3EGA==;EndpointSuffix=core.windows.net"

def orchestrator_function(context: df.DurableOrchestrationContext):
    try:

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient.from_connection_string(connect_str)


        logging.info("\nListing blobs...")

        container_name = "users"
        container_client = blob_service_client.get_container_client(container_name)
        # List the blobs in the container
        blob_list = container_client.list_blobs()

        #user_id = "sid:61fdee33eb5fc49c1e82df86d649c8cd"
        req_body = context.get_input()
        user_id = req_body.get('user_id') # TODO: get this from auth middleware header
        blob_names = req_body.get('file_names')
        namespace = req_body.get('namespace')
        #cosmos_result_id = req_body.get("cosmos_result_id")

        # make sure cosmos_result_id is a string
        # if type(cosmos_result_id) != str:
        #     #set_status_error(cosmos_result_id, user_id, "cosmos_result_id must be a string")
        #     raise Exception("cosmos_result_id must be a string")

        # check that all blob_names start with namespace, and that they are all pdfs, and that they are exist in the container
        def return_err(error):
            logging.error(error)
            return {
                "status": "error",
                "error": error,
            }

        for blob_name in blob_names:
            if not blob_name.startswith(namespace):
                return return_err("All blobs must start with the user's namespace")
            if not blob_name.endswith(".pdf"):
                return return_err("All blobs must be pdfs")
            if not container_client.get_blob_client(blob_name).exists():
                return return_err("Blob " + blob_name + " does not exist in the container")


        logging.info("Found blobs: " + str(blob_names))

        # check that all blobs are in the same directory blob_names[0].split("/")[:-1]
        # TODO: make this work for nested directories
        for blob_name in blob_names:
            if blob_name.split("/")[:-1] != blob_names[0].split("/")[:-1]:
                return return_err("All blobs must be in the same directory")


        index_name = "michael" # TODO: get this from cosmos db or something. Check if it is full or not. If it is full, create a new index name and add it to cosmos db

        first_retry_interval_in_milliseconds = 5000
        max_number_of_attempts = 1

        retry_options = df.RetryOptions(first_retry_interval_in_milliseconds, max_number_of_attempts)
        logging.info("Retry options: " + str(retry_options))

        tasks = []
        for blob_name in blob_names:
            logging.info("Delegating to single process function for blob: " + blob_name)
            settings = {
                "blob_name": blob_name,
                "index_name": index_name,
                "namespace": namespace,
            }
            tasks.append(context.call_activity_with_retry("SingleProcess", retry_options, settings))

        # wait for all tasks to complete
        results = yield context.task_all(tasks)
        logging.info("All tasks completed")
        logging.info("Results: " + str(results))
        return {
            "status": "success",
            "results": results,
            "total_price": sum(results),
        } 

    except Exception as e:
        logging.info("Error in orchestrator function: " + str(e))
        return {"error": "An internal server error occurred. Please try again later."}

                




main = df.Orchestrator.create(orchestrator_function)