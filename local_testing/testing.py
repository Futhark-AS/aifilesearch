from openai.embeddings_utils import get_embedding, cosine_similarity
 
def search_reviews(df, product_description, n=3, pprint=True):
   embedding = get_embedding(product_description, model='text-embedding-ada-002')
   df['similarities'] = df.ada_embedding.apply(lambda x: cosine_similarity(x, embedding))
   res = df.sort_values('similarities', ascending=False).head(n)
   return res
 
df = pd.read_csv('data/ada_reviews.csv')
res = search_reviews(df, 'delicious beans', n=3)