import pinecone
import numpy as np
from tqdm.auto import tqdm
import pandas as pd
import openai
import json
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
