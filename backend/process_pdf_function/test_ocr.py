from azure.cosmos import CosmosClient
import logging
import json
import time
import io
import datetime
import uuid
import re
import os
import pinecone
import numpy as np
from tqdm.auto import tqdm
import pandas as pd
import openai
from azure.storage.blob import BlobServiceClient
from PyPDF2 import PdfWriter, PdfReader
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient

class NotEnoughCreditsError(Exception):
    pass




DOLLAR_TO_CREDIT = 100
PRICE_PER_1000_PAGES = 1.5

# ---------- OCR ----------
endpoint = "https://jorgen-receipt-recognizer.cognitiveservices.azure.com/"
key = os.getenv("ENV_OCR_KEY")

def analyze_read(pdf, blob_name, PRICE_PER_1000_PAGES, user_credits):
    reader = PdfReader(pdf)
    print("Number of pages: ", str(len(reader.pages)))
    print("Page 1 content: ", reader.pages[0])

    num_pages = len(reader.pages)
    credits_to_pay = PRICE_PER_1000_PAGES * num_pages / 1000* DOLLAR_TO_CREDIT
    if user_credits < credits_to_pay:
        raise NotEnoughCreditsError("Not enough credits to process this pdf: price is ", str(credits_to_pay) + " credits and you have ", str(user_credits) + " credits")

    # pages = [
    #             {
    #                 "page_content": page.extract_text().encode("ascii", "ignore").decode("ascii"),
    #                 "file_name": blob_name,
    #                 "page_number": i,
    #             }
    #             for i, page in enumerate(reader.pages)
    #         ]

    # print("Test page 10: ", pages[10]["page_content"])
    # paragraphs = []
    # for page in pages:
    #     paragraphs.extend(get_paragraphs(page))

    # # Check total length of all paragraphs.
    # # If it is less than 100 chars, assume images and go on
    # total_length = sum([len(paragraph["content"]) for paragraph in paragraphs])
    # if total_length >= 100:
    #     return paragraphs, 0, credits_to_pay, num_pages
    # # else move on
    # print("Total length of all paragraphs is less than 100 chars, assuming images and moving on")



    document_analysis_client = DocumentAnalysisClient(
        endpoint=endpoint, credential=AzureKeyCredential(key)
    )
    # price is 1.5 dollars per 1000 pages
    p = 1.5
    print("Price per 1000 pages: $", str(p)) 
    #price = p*/1000 # 2 pages per pdf
    #print(f"Price for extracting text from {len(pdfs)} pdfs with total length {len(pdfs)*2} pages: {price} dollars")
    # path = "folder/document_name-0-4.pdf"
    all_paragraphs = []
    # for i in range(len(pdfs)):
    # pdf is of type PyPDF2.PdfReader
    # pdf = pdfs[i][0]
    # page_number_base = pdfs[i][1]
    # blob_name = pdfs[i][2]

    # buf = io.BytesIO()
    # pdf.write(buf)
    # buf.seek(0)


    poller = document_analysis_client.begin_analyze_document(
        "prebuilt-read", document=pdf
    )
    result = poller.result()
    print("Document contains {} pages: ".format(len(result.pages)))

    price = p*len(result.pages)/1000

    # print("----Languages detected in the document----")
    # for language in result.languages:
    #     print("Language code: '{}' with confidence {}".format(language.locale, language.confidence))

    for paragraph in result.paragraphs:
        print(
            "...Paragraph of length'{}'".format(
                len(paragraph.content)
            )
        )
        if len(paragraph.bounding_regions) > 1:
            # throw exception
            print("Error: more than one bounding region")


        all_paragraphs.append({
            "content": paragraph.content,
            "page_number": paragraph.bounding_regions[0].page_number,# + page_number_base,
            "file_name": blob_name,
            "bounding_box": [[{"x": point.x, "y":point.y} for point in paragraph.bounding_regions[0].polygon]]
        })

        # # close the stream
        # buf.close()

        # # close the pdf
        # pdf.close()
            
    return all_paragraphs, price, credits_to_pay, num_pages

def main():
    blob_name = "test.pdf"
    user_credits = 1000

    with open("test.pdf", "rb") as f:
        pdf = f.read()

    pdf = io.BytesIO(pdf)
    paragraphs, price, credits_to_pay, num_pages = analyze_read(pdf, blob_name, PRICE_PER_1000_PAGES, user_credits)
    print(paragraphs, price, credits_to_pay, num_pages)

if __name__ == "__main__":
    main()