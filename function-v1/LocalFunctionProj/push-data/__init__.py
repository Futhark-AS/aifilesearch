import logging
import pandas as pd

import azure.functions as func


def main(req: func.HttpRequest, inputblob: func.InputStream, outputblob: func.Out[bytes]) -> func.HttpResponse:
    input_file = inputblob.read()
    logging.info(f'Python Queue trigger function processed {len(input_file)} bytes')
    outputblob.set(inputblob)

    # get pandas dataframe from inputblob
    # df = pd.read_csv(inputblob, encoding='utf-8')
    # df = df.head(10)

    return func.HttpResponse(
        "heihei",
        #"Name: {name}, blob size: {size}".format(name=df, size=len(inputblob)),
        status_code=200
    )
