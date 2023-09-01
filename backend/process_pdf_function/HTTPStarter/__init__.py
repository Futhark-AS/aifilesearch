# This function an HTTP starter function for Durable Functions.
# Before running this sample, please:
# - create a Durable orchestration function
# - create a Durable activity function (default name is "Hello")
# - add azure-functions-durable to requirements.txt
# - run pip install -r requirements.txt

import logging
import json
import os
import requests


import asyncio
import aiohttp

import azure.functions as func


async def main(req: func.HttpRequest) -> func.HttpResponse:
    import google.protobuf

    logging.info("HEI2")
    logging.info(google.protobuf.__version__)


    try:
        # user_id = "sid:61fdee33eb5fc49c1e82df86d649c8cd"
        req_body = req.get_json()
        user_id = req_body.get("user_id")
        blob_names = req_body.get("file_names")
        namespace = req_body.get("namespace")
        index_name = req_body.get("index_name")
        # cosmos_result_id = req_body.get("cosmos_result_id")

        # make sure cosmos_result_id is a string
        # if type(cosmos_result_id) != str:
        #     #set_status_error(cosmos_result_id, user_id, "cosmos_result_id must be a string")
        #     raise Exception("cosmos_result_id must be a string")

        # check that all blob_names start with namespace, and that they are all pdfs, and that they are exist in the container
        def return_err(error):
            logging.error(error)
            res = {
                "status": "error",
                "error": error,
            }
            return func.HttpResponse(json.dumps(res))

        for blob_name in blob_names:
            if not blob_name.startswith(namespace):
                return return_err("All blobs must start with the user's namespace")
            if not blob_name.endswith(".pdf"):
                return return_err("All blobs must be pdfs")

        logging.info("Found blobs: " + str(blob_names))

        # check that all blobs are in the same directory blob_names[0].split("/")[:-1]
        # TODO: make this work for nested directories
        for blob_name in blob_names:
            if blob_name.split("/")[:-1] != blob_names[0].split("/")[:-1]:
                return return_err("All blobs must be in the same directory")

        async def start_single_process_async(settings: dict):
            logging.info(
                "Running single process function for blob: " + settings["blob_name"]
            )
            url = "https://process-upload.azurewebsites.net/api/processfile"

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    headers={
                        "Content-Type": "application/json",
                        "x-functions-key": os.environ["ENV_PROCESS_FUNCTION_KEY"],
                    },
                    json=settings,
                ) as resp:
                    if resp.status == 200:
                        response_data = await resp.json()
                        return response_data
                    else:
                        return {
                            "status": "error",
                                                    }


        tasks = []
        for blob_name in blob_names:
            logging.info("Delegating to single process function for blob: " + blob_name)
            settings = {
                "blob_name": blob_name,
                "index_name": index_name,
                "namespace": namespace,
                "user_id": user_id,
            }
            task = asyncio.ensure_future(start_single_process_async(settings))
            tasks.append(task)

        res = {
            "status": "success",
            "message": "Successfully processed and uploaded "
            + str(len(blob_names))
            + " files.",
        }

        results = await asyncio.gather(*tasks)
        for i, result in enumerate(results):
            logging.info(f"Result {i}: {result}")
            if "status" in result and result["status"] == "success":
                continue
            else:
                res["status"] = "error"
                res["message"] = f"Error in processing file {blob_names[i]}"
                break
                

        logging.info(res)
        return func.HttpResponse(json.dumps(res), status_code=200 if res["status"] == "success" else 500)

    except Exception as e:
        # e not instance of NotEnoughCreditsError
        logging.info("Error in orchestrator function: " + str(e))
        res= {
            "status": "error",
            "error": "An internal server error occurred. Please try again later.",
        }
        return func.HttpResponse(json.dumps(res), status_code=500)
