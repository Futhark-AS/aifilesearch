import openai
import re
import json

def is_roman_numeral(string):
  return bool(re.match(r'^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$', string))

def is_date(string):
  return bool(re.match(r'^(0?[1-9]|1[0-2])[/-](0?[1-9]|[12][0-9]|3[01])[/-](19|20)?[0-9]{2}$', string))

def is_page_number(string):
  return bool(re.match(r'^\d+$', string))


n = 2
start = 15
end = 50
save_folder = "michael_pages"
file_name = "michael"
path = save_folder+"/"+file_name+"-%s-%s.json" % (start, end)

min_paragraph_length = 50

# open the file in read mode
with open(path, 'r') as infile:
    # read the contents of the file
    contents = infile.read()
    # convert to object from json
    paragraphs = json.loads(contents)

print("Number of paragraphs: ", len(paragraphs))
i = 0
while i < len(paragraphs):
    #print(i)
    content = paragraphs[i]["content"]
    page_number = paragraphs[i]["page_number"]
    if len(content) < min_paragraph_length: #this works OK, but it's not perfect
        #remove it
        print("Removing: '" + content + "' at page " + str(page_number))
        paragraphs.pop(i)
        i -= 1
    i += 1
        # # if content is a page number, roman number or a date, remove it
        # if is_page_number(content) or is_roman_numeral(content) or is_date(content):
        #     print("Removing: " + content)
        #     paragraphs.pop(i)
        #     i -= 1
        #     continue
                
print("Number of paragraphs: ", len(paragraphs))

# now check if the last paragraph of each page ends with a period
# if not, append the next paragraph to it
i = 0
while i < len(paragraphs):
    content = paragraphs[i]["content"]
    page_number = paragraphs[i]["page_number"]
    if i < len(paragraphs) - 1:
        next_page_number = paragraphs[i+1]["page_number"]
        if page_number != next_page_number and not content.endswith("."):
            next_content = paragraphs[i+1]["content"]
            next_bounding_box = paragraphs[i+1]["bounding_box"]
            # append next_content to content
            print(f"Appending paragraph {i} on page {page_number}, text: '{content}'\nwith paragraph {i+1} on page {next_page_number}, text: '{next_content}'")
            paragraphs[i]["content"] = content + " " + next_content
            paragraphs[i]["bounding_box"] += next_bounding_box
            paragraphs.pop(i+1)
    i += 1

print("Number of paragraphs: ", len(paragraphs))

# if any paragraph is too long (more than 1000 characters), split it into two
# write the list to the new file
json.dump(paragraphs, open(path+".clean", "w"))




# the combined.txt file now contains the contents of all the files
