#!/usr/bin/env python
# coding: utf-8

# ## 1. Load the dataset
# 
# The dataset used in this example is [fine-food reviews](https://www.kaggle.com/snap/amazon-fine-food-reviews) from Amazon. The dataset contains a total of 568,454 food reviews Amazon users left up to October 2012. We will use a subset of this dataset, consisting of 1,000 most recent reviews for illustration purposes. The reviews are in English and tend to be positive or negative. Each review has a ProductId, UserId, Score, review title (Summary) and review body (Text).
# 
# We will combine the review summary and review text into a single combined text. The model will encode this combined text and it will output a single vector embedding.

# To run this notebook, you will need to install: pandas, openai, transformers, plotly, matplotlib, scikit-learn, torch (transformer dep), torchvision, and scipy.

# In[2]:


import pandas as pd

input_datapath = 'data/fine_food_reviews_1k.csv'  # to save space, we provide a pre-filtered dataset
df = pd.read_csv(input_datapath, index_col=0)
# grab only column with text
#df = df[['translated', 'body', "header"]]
df = df[["Text", "Summary", "Time"]]
df["combined"] = "Title: " + df["Summary"] + "\tContent: " + df["Text"]
print(df["combined"].head(5))


# In[2]:


# subsample to 1k most recent reviews and remove samples that are too long
df = df.sort_values('Time').tail(1_100)
df.drop('Time', axis=1, inplace=True)

from transformers import GPT2TokenizerFast
tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")

# # remove reviews that are too long
print(len(df))
df['n_tokens'] = df.combined.apply(lambda x: len(tokenizer.encode(x)))
df = df[df.n_tokens<8000]
print(len(df))


# ### 2. Get embeddings and save them for future reuse

# In[7]:


import openai
import numpy as np
from openai.embeddings_utils import get_embedding
# Ensure you have your API key set in your environment per the README: https://github.com/openai/openai-python#usage
openai.api_key = "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"


#df = df.head(30)
df['ada_search'] = df.combined.apply(lambda x: get_embedding(x, engine='text-embedding-ada-002'))
#df["len"] = df.ada_search.apply(lambda x: len(x))
#print(df["len"])
df.to_csv('data/fine_food_reviews_with_embeddings_1k.csv')

