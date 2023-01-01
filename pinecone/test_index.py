import openai
import pinecone

openai.api_key = "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"
# initialize connection to pinecone (get API key at app.pinecone.io)
pinecone.init(
    api_key="d7c72c84-1057-48cb-b52f-d857d4c04380",
    environment="us-west1-gcp"
)
# check if 'openai' index already exists (only create index if not)
index_name = "michael"
# connect to index
index = pinecone.Index(index_name)


query = "What are the different types of competitive advantage?"

xq = openai.Embedding.create(input=query, engine="text-embedding-ada-002")['data'][0]['embedding']

print("Finished embedding query")

res = index.query([xq], top_k=10, include_metadata=True, )
print(res)

# print res["metadata"]["content"] for each
for match in res.matches:
    print(match["metadata"]["content"])