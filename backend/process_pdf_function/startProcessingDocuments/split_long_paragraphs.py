import re

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

def split_long_paragraphs(paragraphs):
    new_paragraphs = []
    for i in range(len(paragraphs)):
        paragraph = paragraphs[i]
        if len(paragraph["content"]) > 250*6: #250 words ish
            print(f"...Splitting paragraph with length {len(paragraph['content'])} on page {paragraph['page_number']} of file {paragraph['file_name']}")
            segments = split_paragraph(paragraph["content"], segment_length=Math.min(len(paragraph["content"])/2, 250*5), overlap_length=100)
            print("Length of new segments:", [len(segment) for segment in segments])
            # add segments as new paragraphs
            for segment in segments:
                new_paragraphs.append({"page_number": paragraph["page_number"], "content": segment, "bounding_box": paragraph["bounding_box"], "file_name": paragraph["file_name"]})

        else:
            new_paragraphs.append(paragraph)


    return new_paragraphs
    