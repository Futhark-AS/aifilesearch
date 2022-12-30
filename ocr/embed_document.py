import re
import pinecone
import numpy as np
from tqdm.auto import tqdm
import pandas as pd
import openai
openai.api_key = "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"
pinecone.init(
    api_key="d7c72c84-1057-48cb-b52f-d857d4c04380",
    environment="us-west1-gcp"
)


def extract_segments(filename, segment_length=400, overlap_length=50):
  # Read the entire text file into a single string
  with open(filename, 'r') as f:
    text = f.read()

  # Split the text into a list of sentences
  sentences = re.split(r'[.!?]', text)

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

def embed_segments(segments):
    index_name = "michael"
    if index_name not in pinecone.list_indexes():
        pinecone.create_index(index_name, dimension=1536)
    # connect to index
    index = pinecone.Index(index_name)

    count = 0  # we'll use the count to create unique IDs
    batch_size = 32  # process everything in batches of 32
    for i in tqdm(range(0, len(segments), batch_size)):
        # set end position of batch
        i_end = min(i+batch_size, len(segments))
        # get batch of lines and IDs
        segments_batch = segments[i:i_end]
        ids_batch = [str(n) for n in range(i, i_end)]
        #print("ids_batch", ids_batch)
        # prep metadata and upsert batch
        meta = [{"text": segment } for segment in segments_batch]
        #print("HREI", type(meta))

        # create embeddings for batch
        res = openai.Embedding.create(input=segments_batch, engine="text-embedding-ada-002")
        embeds = [record['embedding'] for record in res['data']]
        #print(lines_batch["ada_search"])
        to_upsert = list(zip(ids_batch, embeds, list(meta)))
        #print(to_upsert.__class__.__name__)
        #print(type(to_upsert))
        #print(to_upsert)
        # upsert to Pinecone
        index.upsert(vectors=to_upsert)


if __name__ == '__main__':
    segments = extract_segments('michael_pages/combined.txt')
    print('Extracted {} segments'.format(len(segments)))
    print('First segment: {}'.format(segments[0]))
    print('Last segment: {}'.format(segments[-1]))

    embed_segments(segments)