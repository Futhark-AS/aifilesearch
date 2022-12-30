import pinecone
import numpy as np
from tqdm.auto import tqdm
import pandas as pd


# import data as pandas dataframe from ../data/all_lovdata_embedded.csv
df = pd.read_csv("../data/all_lovdata_embedded.csv", index_col=0)
df["ada_search"] = df.ada_search.apply(lambda x: list(np.fromstring(x[1:-1], sep=",")))
print("Loaded data", df.shape)

# initialize connection to pinecone (get API key at app.pinecone.io)
pinecone.init(
    api_key="d7c72c84-1057-48cb-b52f-d857d4c04380",
    environment="us-west1-gcp"
)
# check if 'openai' index already exists (only create index if not)
index_name = "lovdata"
if index_name not in pinecone.list_indexes():
    pinecone.create_index(index_name, dimension=len(df.iloc[0].ada_search))
# connect to index
index = pinecone.Index(index_name)

count = 0  # we'll use the count to create unique IDs
batch_size = 32  # process everything in batches of 32
print("Ada shape", df["ada_search"].shape)
for i in tqdm(range(0, len(df), batch_size)):
    # set end position of batch
    i_end = min(i+batch_size, len(df))
    # get batch of lines and IDs
    lines_batch = df[i:i_end]
    ids_batch = [str(n) for n in range(i, i_end)]
    #print("ids_batch", ids_batch)
    # prep metadata and upsert batch
    meta = [{'url': line["url"], "law_name": line["law_name"]} for (index, line) in lines_batch.iterrows()]
    #print(lines_batch["ada_search"])
    print("HREI", type(meta))
    to_upsert = list(zip(ids_batch, lines_batch["ada_search"].to_list(), list(meta)))
    print(to_upsert.__class__.__name__)
    print(type(to_upsert))
    #print(to_upsert)
    # upsert to Pinecone
    index.upsert(vectors=to_upsert)