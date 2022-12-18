from bs4 import BeautifulSoup
import requests
import pandas as pd
import html2text
import nltk
import re
import csv
base = "https://lovdata.no"
lover_url = "https://lovdata.no/register/lover?year=*&letter=*&ministry=$ministry&offset=$offset"
barne_url = lover_url.replace("$ministry", "Barne-+og+familiedepartementet")

def click_next_page(offset):
    response = requests.get(barne_url.replace("$offset", str(offset)))
    soup = BeautifulSoup(response.text, "html.parser")
    articles = list(map( lambda x: x.find("a")["href"], soup.find_all("article")))
    if(len(articles) == 0):
        return None
    return articles


offset = 0
articles = []
next_articles = click_next_page(offset)
max_pages = 999
n = 0
while next_articles and n <= max_pages:
    n += 1
    offset += 20
    articles = articles + next_articles
    next_articles = click_next_page(offset)


print(len(articles))


# https://lovdata.no/dokument/NL/lov/2022-12-16-96
# TODO: 
#   click 'vis hele dokumentet' to get everything for some laws (https://lovdata.no/dokument/NL/lov/1997-06-13-44)
#   goes to this: https://lovdata.no/dokument/NL/lov/1997-06-13-44/*#&#x2a;
def get_lov_data(link):
    url = base + link
    print(url)
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    # Get all divs that has data-id starting with "paragraf_", and append to list
    paragrafs = soup.find_all('div', {'data-id': re.compile(r'^PARAGRAF_')})
    # Get html from each result from find_all
    paragrafs = list(map(lambda x: str(x), paragrafs))
    return paragrafs



# Get all paragrafs from all articles and create a pandas dataframe
paragrafs = []
# print(paragrafs)
i = 0
max_paragraphs = 10000
for article in articles:
    if i > max_paragraphs:
        break
    new_paragraphs = get_lov_data(article)
    i += len(new_paragraphs)
    print(len(new_paragraphs))
    paragrafs = paragrafs + new_paragraphs

# Create pandas dataframe with 1 column named "text"
df = pd.DataFrame(paragrafs, columns=["html"])
# print(df)
df.to_csv("test/lovdata.csv", index=True)



#print(get_lov_data(first_article)[0].text.strip())
