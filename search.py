import pandas as pd
import numpy as np
from translate import translate_text

# If you have not run the "Obtain_dataset.ipynb" notebook, you can download the datafile from here: https://cdn.openai.com/API/examples/data/fine_food_reviews_with_embeddings_1k.csv
datafile_path = "data/fine_food_reviews_with_embeddings_1k.csv"

df = pd.read_csv(datafile_path)
#df = df.head(30)
#print(df)
df["ada_search"] = df.ada_search.apply(eval).apply(np.array)

import openai
openai.api_key = "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"
from openai.embeddings_utils import get_embedding, cosine_similarity

def search_lover(df, text, n=3):
    embedding = get_embedding(
        text,
        engine="text-embedding-ada-002"
    )
    df["similarities"] = df.ada_search.apply(lambda x: cosine_similarity(x, embedding))

    res = (
        df.sort_values("similarities", ascending=False)
    )
    # print all similarities
    #print(res.similarities)
    return res
text = """
are there any reviews about nuts that are really spicy?
"""

# I want to take up a loan. Who can give me advice?

res =  search_lover(df, text, n=3)
res = res[["combined", "similarities"]]
best = res.head(10)
worst = res.tail(10)
print(best, worst)
# write to file
res.to_csv("output.csv", index=False)
