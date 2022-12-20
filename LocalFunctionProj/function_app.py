import azure.functions as func
#import pandas as pd

app = func.FunctionApp()

@app.function_name(name="HttpTrigger1")
@app.route(route="hello") # HTTP Trigger
def test_function(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse("HttpTrigger1 function processed a request!!!")


# @app.function_name(name="save")
# @app.blob_output(arg_name="df", path="{name}/df.csv",
#                   connection="AzureWebJobsStorage")
# def save_blob(myblob):
#     test = [1, 2, 3]
#     df = pd.DataFrame(test, columns=["test"])
#     # Save the dataframe to a csv file
#     myblob.set(df.to_csv(index=False))
#     logging.info(f"Python save function processed blob \n"
#                 f"Name: {myblob.name}\n"
#                 f"Blob Size: {myblob.length} bytes")

# @app.function_name(name="blob_trigger")
# @app.blob_input(arg_name="myblob", path="test/{name}", connection="AzureWebJobsStorage")
# def blob_trigger(myblob: func.InputStream):
#     logging.info(f"Python blob trigger function processed blob \n"
#                 f"Name: {myblob.name}\n"
#                 f"Blob Size: {myblob.length} bytes")

