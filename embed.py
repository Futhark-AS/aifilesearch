#!/usr/bin/env python
# coding: utf-8
import pandas as pd
from transformers import GPT2TokenizerFast
import openai
import numpy as np
from openai.embeddings_utils import get_embedding
from utils import log_exc
import threading
import numpy as np
openai.api_key = "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"


def embed_laws(from_path, to_path, initialize_new=False, start_index=0, remove_long=False, head=None):
    df = pd.read_csv(from_path, index_col=0)

    if head:
        df = df.head(head)
    #df = df.reset_index(drop=False)
    df["combined"] = ""

    for i, row in df.iterrows():
        if isinstance(row['chapter'], float):
            df.at[i, "combined"] = row["law_name"] + "\nTittel: " +  row["paragraph_title"] + "\n\n" + row["paragraph"]
        else:
            if(isinstance(row['paragraph'], float)):
                df.at[i, "combined"] = row["law_name"] + "\nKapittel: " + row["chapter"]  + "\nTittel: " + row["paragraph_title"]
            else:
                df.at[i, "combined"] = row["law_name"] + "\nKapittel: " + row["chapter"]  + "\nTittel: " + row["paragraph_title"] + "\n" + row["paragraph"]
        
    print(df)


    if remove_long:
        tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")

        # # remove reviews that are too long
        df['n_tokens'] = df.combined.apply(lambda x: len(tokenizer.encode(x)))
        df = df[df.n_tokens<8000]
        df = df.reset_index(drop=False)

        total_tokens = df.n_tokens.sum()

        price = total_tokens * 0.0004 / 1000

        print(f"Total tokens: {total_tokens}")
        print(f"Price: {price}")

    # Create a lock
    lock_df = threading.Lock()

    @log_exc(10)
    def embed_text_to_df(df, i, text):
        embedding = get_embedding(
            text,
            engine="text-embedding-ada-002"
        )
        with lock_df:
            df.at[i, "ada_search"] = embedding

    ####df["ada_search"] = ""

    # Create and start the threads
    threads = []
    num_threads = 10
    i = start_index
    while i < len(df):
        threads = []
        j = 0
        while j < num_threads and i+j < len(df):
            t = threading.Thread(target=embed_text_to_df, args=(df, i+j, df.at[i+j, "combined"],))
            t.start()
            threads.append(t)
            j+=1
        
        for j in range(len(threads)):
            threads[j].join() 

        i+= num_threads

        # save to csv if we have 10 rows
        if i % (num_threads*10) == 0:
            print("Saving to csv", i)
            df[["url", "law_name", "chapter", "paragraph_title", "paragraph", "ada_search"]].to_csv(to_path)

    df[["url", "law_name", "chapter", "paragraph_title", "paragraph", "ada_search"]].to_csv(to_path)

    # Print the final DataFrame
    print(df)

if __name__ == "__main__":
    embed_laws("data/all_lovdata_embedded.csv", "data/all_lovdata_embedded.csv", start_index=9000)



#df['ada_search'] = df.combined.apply(embed_text)
#df["len"] = df.ada_search.apply(lambda x: len(x))
#print(df["len"])
#df.to_csv('data/all_lovdata_embedded.csv')

# from concurrent.futures import ThreadPoolExecutor
# import csv

#df = df.head(50)
# def parallelize_embedding(df):
#     df_length = len(df)
#     with ThreadPoolExecutor() as executor:
#         results = []
#         for index, row in df.iterrows():
#             result = executor.submit(embed_text, row.combined)
#             results.append(result)
#             if index != 0 and index % 10 == 0:
#                 for i, future in enumerate(results):
#                     print(f"Index: {index-10+i} of {df_length}")
#                     df.at[index-10+i, 'ada_search'] = future.result()
#                     df.to_csv("embedded_text.csv")
#                 results = []



# df = df.head(50)
# parallelize_embedding(df)