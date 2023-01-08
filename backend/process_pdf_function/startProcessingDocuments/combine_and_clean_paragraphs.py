def combine_and_clean_paragraphs(paragraphs):
    min_paragraph_length = 50
    cleaned_paragraphs = []

    for paragraph in paragraphs:
        #print(i)
        content = paragraph["content"]
        page_number = paragraph["page_number"]
        if len(content) < min_paragraph_length: #this works OK, but it's not perfect
            #remove it
            print("Removing: '" + content + "' at page " + str(page_number) + " of file " + paragraph["file_name"])

        else:
            cleaned_paragraphs.append(paragraph)
                    
    print("Number of paragraphs after clean: ", len(cleaned_paragraphs))

    # now check if the last paragraph of each page ends with a period
    # if not, append the next paragraph to it
    i = 0
    while i < len(cleaned_paragraphs):
        content = cleaned_paragraphs[i]["content"]
        page_number = cleaned_paragraphs[i]["page_number"]
        bounding_box = cleaned_paragraphs[i]["bounding_box"]
        file_name = cleaned_paragraphs[i]["file_name"]
        if i < len(cleaned_paragraphs) - 1:
            next_file_name = cleaned_paragraphs[i+1]["file_name"]
            if file_name != next_file_name: # only combine paragraphs from the same file
                i+=1
                continue

            next_page_number = cleaned_paragraphs[i+1]["page_number"]
            if page_number != next_page_number and not content.endswith("."):
                next_content = cleaned_paragraphs[i+1]["content"]
                next_bounding_box = cleaned_paragraphs[i+1]["bounding_box"]
                # append next_content to content
                print(f"Appending paragraph on page {page_number} of file {file_name} with paragraph on page {next_page_number} of file {next_file_name}")
                cleaned_paragraphs[i]["content"] = content + " " + next_content
                cleaned_paragraphs[i]["bounding_box"] = [bounding_box, next_bounding_box] #makes sense to have one array for each bounding box
                cleaned_paragraphs.pop(i+1)
        i += 1

    print("Number of paragraphs after combining paragraphs split across pages: ", len(cleaned_paragraphs))

    return cleaned_paragraphs
