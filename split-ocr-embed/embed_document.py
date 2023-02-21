import re
import pinecone
import numpy as np
from tqdm.auto import tqdm
import pandas as pd
import openai
import json
openai.api_key = "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"
pinecone.init(
    api_key="4af86256-76e3-4317-9343-964fb445a00a",
    environment="us-east1-gcp"
)


def split_paragraph(paragraph_content, segment_length=500, overlap_length=70):
  # Split the text into a list of sentences
  sentences = re.split(r'[.!?]', paragraph_content)

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

    # calculate the total number of characters in the document
    total_chars = sum([len(segment["content"]) for segment in segments])
    price = 0.0004*total_chars/1000
    print("Price for embedding document: $", price, sep="")

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
        #for segment in segments:
            #print(segment["content"][:6])
        meta = [
            {
            "page_number": segment["page_number"], 
            "bounding_box": json.dumps(segment["bounding_box"]),
            # get first 100 characters of content
            "content": segment["content"]
            } for segment in segments_batch]
        #print(meta)

        content_batch = [segment["content"] for segment in segments_batch]

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
        index.upsert(vectors=to_upsert)


start = 15
end = 50
save_folder = "michael_pages"
file_name = "michael"
path = save_folder+"/"+file_name+"-%s-%s.json.clean" % (start, end)

if __name__ == '__main__':
    # open file
    with open(path, "r") as f:
        data = f.read()
        paragraphs = json.loads(data)
    # get json data
    for i in range(len(paragraphs)):
        paragraph = paragraphs[i]
        if len(paragraph["content"]) > 250*5: #250 words ish
            print(f"...Splitting paragraph with length {len(paragraph['content'])} on page {paragraph['page_number']}")
            segments = split_paragraph(paragraph["content"])
            # remove paragraph
            paragraphs.pop(i)
            i -= 1

            print("Length of new segments:", [len(segment) for segment in segments])
            # add segments as new paragraphs
            for segment in segments:
                paragraphs.append({"page_number": paragraph["page_number"], "content": segment, "bounding_box": paragraph["bounding_box"]})

        if(len(paragraph["content"]) < 50):
            print("Something went wrong with paragraph on page", paragraph["page_number"], "length:", len(paragraph["content"]))
            print(paragraph["content"])
    

    print('Extracted {} paragraphs'.format(len(paragraphs)))
    print('First paragraph: {}'.format(paragraphs[0]))
    print('Last paragraph: {}'.format(paragraphs[-1]))
    
    # embed paragraphs
    embed_segments(paragraphs)