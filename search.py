import pandas as pd
import numpy as np

# If you have not run the "Obtain_dataset.ipynb" notebook, you can download the datafile from here: https://cdn.openai.com/API/examples/data/fine_food_reviews_with_embeddings_1k.csv
datafile_path = "data/all_lovdata_embedded.csv"

df = pd.read_csv(datafile_path)
#df = df.head(30)
#print(df)
df["ada_search"] = df.ada_search.apply(eval).apply(np.array)

import openai
openai.api_key = "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"
from openai.embeddings_utils import get_embedding, cosine_similarity
from utils import log_exc

def search_lover(df, text, n=3):
    embedding = get_embedding(
        text,
        engine="text-embedding-ada-002"
    )
    df["similarities"] = df.ada_search.apply(log_exc(10)(lambda x: cosine_similarity(x, embedding)))

    res = (
        df.sort_values("similarities", ascending=False)
    )
    # print all similarities
    #print(res.similarities)
    return res
text = """
Hva er nummeret på loven som kom 10. april 2015
"""

# I want to take up a loan. Who can give me advice?

res =  search_lover(df, text, n=3)
res = res[["similarities", "law_name", "combined"]]
best = res.head(10)
worst = res.tail(10)
print(best, worst)
# write to file
res.to_csv("output.csv", index=False)
