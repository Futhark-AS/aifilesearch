from translate import translate_text
import html2text
import pandas as pd
from bs4 import BeautifulSoup

# # open data/lovdata.csv and read it into a pandas dataframe
df = pd.read_csv('test/lovdata.csv')
#df = df.head(30)

# create a new column in the dataframe called 'translated'
df['translated'] = ''

def test_clean_paragraph():
    paragraph = df['html'][0]
    print(paragraph)
    h,b = clean_paragraph(paragraph)

    print(h)
    print()
    print()
    print(b)

def clean_paragraph(paragraph_html):
    soup =  BeautifulSoup(paragraph_html, 'html.parser')
    #print(soup.prettify())
    # find the element with the class 'paragrafHeader'
    header = soup.find(class_='paragrafHeader')

    header_text = header.text
    all_text = soup.text

    body = all_text.replace(header_text, '')

    # return the title and the paragraph text

    return header_text, body

total_char = 0
#loop through the dataframe and translate each row
for index, row in df.iterrows():
    if index > 10000:
        break
    # first, beautify the html in the 'Text' column
    header_text, body = clean_paragraph(row['html'])
    df.at[index, 'header'] = header_text
    df.at[index, 'body'] = body
    text = "Title: " + header_text + "\nBody: " + body
    translated = translate_text(text)
    total_char = total_char + len(text)
    print(index)
    print(total_char)
    df.at[index, 'translated'] = translated

# save the dataframe to a new csv file
df.to_csv('data/lovdata_translated.csv')

