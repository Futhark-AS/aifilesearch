import pandas as pd
import numpy as np
import openai
from openai.embeddings_utils import get_embedding, cosine_similarity
openai.api_key = "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"
from utils import log_exc


# If you have not run the "Obtain_dataset.ipynb" notebook, you can download the datafile from here: https://cdn.openai.com/API/examples/data/fine_food_reviews_with_embeddings_1k.csv
datafile_path = "data/all_lovdata_embedded.csv"
text = """
Hvordan er reglene for skatt på aksjegevinst for en privatperson?
"""
df = pd.read_csv(datafile_path, index_col=0)

def search_lover(text, n=10):
    print(df)
    df["ada_search"] = df.ada_search.apply(lambda x: np.fromstring(x[1:-1], sep=","))
    print(df)
    embedding = get_embedding(
        text,
        engine="text-embedding-ada-002"
    )

    df["similarities"] = df.ada_search.apply(log_exc(1000)(lambda x: cosine_similarity(x, embedding)))

    res = (
        df.sort_values("similarities", ascending=False)
        #.head(n)
    )

    res = res[["similarities", "law_name", "chapter", "paragraph_title", "paragraph"]]
    best = res.head(10)
    worst = res.tail(10)
    print(best, worst)
    # write to file
    return res.head(n)
