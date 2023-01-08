import logging

import azure.functions as func

import re
import io
import os
import json
import pinecone
import numpy as np
from tqdm.auto import tqdm
import pandas as pd
import openai
from azure.storage.blob import BlobServiceClient
from PyPDF2 import PdfWriter, PdfReader
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient

# ---------- OCR ----------
endpoint = "https://jorgen-receipt-recognizer.cognitiveservices.azure.com/"
key = "ce4f6273acf642888e33b283c7481323"

def format_bounding_box(bounding_box):
    if not bounding_box:
        return "N/A"
    return ", ".join(["[{}, {}]".format(p.x, p.y) for p in bounding_box])

def analyze_read(pdfs):
    document_analysis_client = DocumentAnalysisClient(
        endpoint=endpoint, credential=AzureKeyCredential(key)
    )
    # price is 1.5 dollars per 1000 pages
    p = 1.5
    print("Price per 1000 pages: " + str(p) + " dollars", end="\n\n")
    price = p*len(pdfs)*2/1000 # 2 pages per pdf
    print(f"Price for extracting text from {len(pdfs)} pdfs with total length {len(pdfs)*2} pages: {price} dollars", end="\n\n")
    # path = "folder/document_name-0-4.pdf"
    all_paragraphs = []
    for i in range(len(pdfs)):
        # pdf is of type PyPDF2.PdfReader
        pdf = pdfs[i][0]
        page_number_base = pdfs[i][1]
        blob_name = pdfs[i][2]

        buf = io.BytesIO()
        pdf.write(buf)
        buf.seek(0)
        poller = document_analysis_client.begin_analyze_document(
            "prebuilt-read", document=buf
        )
        result = poller.result()
        print("Document contains {} pages: ".format(len(result.pages)))

        print("----Languages detected in the document----")
        for language in result.languages:
            print("Language code: '{}' with confidence {}".format(language.locale, language.confidence))

        for paragraph in result.paragraphs:
            print(
                "...Paragraph of length'{}'".format(
                    len(paragraph.content)
                )
            )
            #print("...Bounding regions: {}".format(paragraph.bounding_regions))
            if len(paragraph.bounding_regions) > 1:
                # throw exception
                print("Error: more than one bounding region")

            all_paragraphs.append({
                "content": paragraph.content,
                "page_number": paragraph.bounding_regions[0].page_number + page_number_base,
                "file_name": blob_name,
                "bounding_box": [{"x": point.x, "y":point.y} for point in paragraph.bounding_regions[0].polygon]
            })

            
    return all_paragraphs, price



# ---------- Combine and clean paragraphs ----------
def combine_and_clean_paragraphs(paragraphs):
    min_paragraph_length = 50
    cleaned_paragraphs = []

    for paragraph in paragraphs:
        #print(i)
        content = paragraph["content"]
        page_number = paragraph["page_number"]
        if len(content) < min_paragraph_length: #this works OK, but it's not perfect
            #remove it
            print("Removing: '" + content + "' at page " + str(page_number) + " of file " + paragraph["file_name"])

        else:
            cleaned_paragraphs.append(paragraph)
                    
    print("Number of paragraphs after clean: ", len(cleaned_paragraphs))

    # now check if the last paragraph of each page ends with a period
    # if not, append the next paragraph to it
    i = 0
    while i < len(cleaned_paragraphs):
        content = cleaned_paragraphs[i]["content"]
        page_number = cleaned_paragraphs[i]["page_number"]
        bounding_box = cleaned_paragraphs[i]["bounding_box"]
        file_name = cleaned_paragraphs[i]["file_name"]
        if i < len(cleaned_paragraphs) - 1:
            next_file_name = cleaned_paragraphs[i+1]["file_name"]
            if file_name != next_file_name: # only combine paragraphs from the same file
                i+=1
                continue

            next_page_number = cleaned_paragraphs[i+1]["page_number"]
            if page_number != next_page_number and not content.endswith("."):
                next_content = cleaned_paragraphs[i+1]["content"]
                next_bounding_box = cleaned_paragraphs[i+1]["bounding_box"]
                # append next_content to content
                print(f"Appending paragraph on page {page_number} of file {file_name} with paragraph on page {next_page_number} of file {next_file_name}")
                cleaned_paragraphs[i]["content"] = content + " " + next_content
                cleaned_paragraphs[i]["bounding_box"] = [bounding_box, next_bounding_box] #makes sense to have one array for each bounding box
                cleaned_paragraphs.pop(i+1)
        i += 1

    print("Number of paragraphs after combining paragraphs split across pages: ", len(cleaned_paragraphs))

    return cleaned_paragraphs



#------------Split long paragraphs into smaller paragraphs----------------
def split_paragraph(paragraph_content, segment_length=500, overlap_length=70):
  # Split the text into a list of sentences
  sentences = re.split(r'[.!?]', paragraph_content)

  # Initialize the list of segments
  segments = []

  # Initialize the current segment with the first sentence
  segment = sentences[0] + '.'

  # Iterate through the rest of the sentences
  for i, sentence in enumerate(sentences[1:]):
    # If adding the sentence to the segment would make it too long,
    # append the current segment to the list of segments and start a new segment
    if len(segment) + len(sentence) > segment_length:
      # Add the overlap by concatenating the first 50 words of the next segment
      overlap = sentence[:overlap_length] + "..."
      segment += overlap
      segments.append(segment)
      # initialize the next segment with words from the previous sentence plus this sentence
      segment = "..." + sentences[i -1][-overlap_length:] + "." + sentence + '.'
    # Otherwise, add the sentence to the current segment
    else:
      segment += sentence + '.'

  # Append the final segment to the list of segments
  segments.append(segment)

  return segments

def split_long_paragraphs(paragraphs):
    new_paragraphs = []
    for i in range(len(paragraphs)):
        paragraph = paragraphs[i]
        if len(paragraph["content"]) > 250*6: #250 words ish
            print(f"...Splitting paragraph with length {len(paragraph['content'])} on page {paragraph['page_number']} of file {paragraph['file_name']}")
            segments = split_paragraph(paragraph["content"], segment_length=Math.min(len(paragraph["content"])/2, 250*5), overlap_length=100)
            print("Length of new segments:", [len(segment) for segment in segments])
            # add segments as new paragraphs
            for segment in segments:
                new_paragraphs.append({"page_number": paragraph["page_number"], "content": segment, "bounding_box": paragraph["bounding_box"], "file_name": paragraph["file_name"]})

        else:
            new_paragraphs.append(paragraph)


    return new_paragraphs
    

# ---------- Embed paragraphs ----------
openai.api_key = "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"
pinecone.init(
    api_key="d7c72c84-1057-48cb-b52f-d857d4c04380",
    environment="us-west1-gcp"
)

def embed_paragraphs(paragraphs, namespace, index_name):
    if index_name not in pinecone.list_indexes():
        pinecone.create_index(index_name, dimension=1536)
    # connect to index
    index = pinecone.Index(index_name)

    # calculate the total number of characters in the document
    total_chars = sum([len(paragraph["content"]) for paragraph in paragraphs])
    price = 0.0004*total_chars/1000
    print("Price for embedding document: $", price, sep="")

    batch_size = 32  # process everything in batches of 32
    for i in tqdm(range(0, len(paragraphs), batch_size)):
        # set end position of batch
        i_end = min(i+batch_size, len(paragraphs))
        # get batch of lines and IDs
        paragraphs_batch = paragraphs[i:i_end]
        ids_batch = ["" + namespace + "_" + str(n) for n in range(i, i_end)] # TODO: make sure that this works even when uploading new ones to the same namespace
        #print("ids_batch", ids_batch)
        # prep metadata and upsert batch
        #for paragraph in paragraphs:
            #print(paragraph["content"][:6])
        meta = [
            {
            "page_number": paragraph["page_number"], 
            "bounding_box": json.dumps(paragraph["bounding_box"]),
            "file_name": paragraph["file_name"],
            # get first 100 characters of content
            "content": paragraph["content"]
            } for paragraph in paragraphs_batch]
        #print(meta)

        content_batch = [paragraph["content"] for paragraph in paragraphs_batch]

        # create embeddings for batch
        res = openai.Embedding.create(input=content_batch, engine="text-embedding-ada-002")
        embeds = [record['embedding'] for record in res['data']]
        #print(lines_batch["ada_search"])
        to_upsert = list(zip(ids_batch, embeds, meta))

        # get average length of meta["content"]
        #print("Average length of content:", np.mean([len(up[2]["content"]) for up in to_upsert]))
        #print(to_upsert.__class__.__name__)
        #print(type(to_upsert))
        #print(to_upsert)
        # upsert to Pinecone
        index.upsert(vectors=to_upsert, namespace=namespace)    

    return price







# Retrieve the connection string for use with the application. The storage
connect_str = "DefaultEndpointsProtocol=https;AccountName=nlpsearchapi;AccountKey=E3hMExwQh1j50yYeW/KUA5tPkZLf0VwEu3/jlz7NRGgCmElfjpiBbnTRN5LxrN77warRvknuP9bM+AStWj3EGA==;EndpointSuffix=core.windows.net"


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient.from_connection_string(connect_str)


    logging.info("\nListing blobs...")

    container_name = "users"
    container_client = blob_service_client.get_container_client(container_name)
    # List the blobs in the container
    blob_list = container_client.list_blobs()

    #user_id = "sid:61fdee33eb5fc49c1e82df86d649c8cd"
    req_body = req.get_json()
    user_id = req_body.get('id') # TODO: get this from auth middleware header
    blob_names = req_body.get('file_names')
    project = req_body.get('project')
    namespace = user_id + "/" + project #TODO: check with the alllowed_namespaces list if this user can access other people's projects

    # check that all blob_names start with namespace, and that they are all pdfs, and that they are exist in the container
    for blob_name in blob_names:
        if not blob_name.startswith(namespace):
            raise Exception("All blobs must start with the user's namespace")
        if not blob_name.endswith(".pdf"):
            raise Exception("All blobs must be pdfs")
        if not container_client.get_blob_client(blob_name).exists():
            raise Exception("All blobs must exist in the container")


    logging.info("Found blobs: " + str(blob_names))

    # check that all blobs are in the same directory blob_names[0].split("/")[:-1]
    # TODO: make this work for nested directories
    for blob_name in blob_names:
        if blob_name.split("/")[:-1] != blob_names[0].split("/")[:-1]:
            raise Exception("All blobs must be in the same directory")

    index_name = "michael" # TODO: get this from cosmos db or something. Check if it is full or not. If it is full, create a new index name and add it to cosmos db

    for blob_name in blob_names:
        small_pdfs = []
        logging.info("\nDownloading blob " + blob_name)
        blob = container_client.download_blob(blob_name).readall()
        on_fly = io.BytesIO(blob)
        pdf = PdfReader(on_fly)
        for i in range(0, len(pdf.pages), 2):
            output = PdfWriter()
            for j in range(i, i+2):
                if j < len(pdf.pages):
                    output.add_page(pdf.pages[j])
            small_pdfs.append((output, i, blob_name))

    logging.info(f"Number of small pdfs: {len(small_pdfs)}")

    test_pdf = small_pdfs[:2]

    paragraphs, price = analyze_read(test_pdf)

    logging.info(f"Number of paragraphs: {len(paragraphs)}")

    cleaned_paragraphs = combine_and_clean_paragraphs(paragraphs) 

    logging.info(f"Cleaned paragraphs. Number of paragraphs now: {len(cleaned_paragraphs)}")

    split_paragraphs = split_long_paragraphs(cleaned_paragraphs)

    logging.info(f"Split paragraphs. Number of paragraphs now: {len(split_paragraphs)}")

    logging.info(f'Extracted {len(split_paragraphs)} paragraphs')
    logging.info(f'First paragraph: {split_paragraphs[0]}')
    logging.info(f'Last paragraph: {split_paragraphs[-1]}')

    logging.info("Now embedding paragraphs")
    embed_price = embed_paragraphs(split_paragraphs, namespace, index_name)
    logging.info("Done embedding paragraphs")

    logging.info(f"Total price: ${price + embed_price}")

    return func.HttpResponse(
            "This HTTP triggered function executed successfully. Total price: $" + str(price + embed_price),
            status_code=200
    )
