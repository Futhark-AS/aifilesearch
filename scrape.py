from bs4 import BeautifulSoup
import requests
import pandas as pd
import re
from utils import log_exc
from multi_thread_list import multi_thread_list
import threading
base = "https://lovdata.no"
# lover_url = "https://lovdata.no/register/lover?year=*&letter=*&ministry=$ministry&offset=$offset"
lover_url = "https://lovdata.no/register/lover?year=*&letter=*&ministry=*&offset=$offset"

# barne_url = lover_url.replace("$ministry", "Barne-+og+familiedepartementet")

@log_exc(10)
def click_next_page(offset):
    response = requests.get(lover_url.replace("$offset", str(offset)))
    soup = BeautifulSoup(response.text, "html.parser")
    articles = list(map( lambda x: x.find("a")["href"], soup.find_all("article")))
    if(len(articles) == 0):
        return None
    return articles




# https://lovdata.no/dokument/NL/lov/2022-12-16-96
# TODO: 
#   click 'vis hele dokumentet' to get everything for some laws (https://lovdata.no/dokument/NL/lov/1997-06-13-44)
#   goes to this: https://lovdata.no/dokument/NL/lov/1997-06-13-44/*#&#x2a;


# PARAGRAPH
# {
    # law_name: string
    # paragraph: string,
    # chapter: string,
    # sub_chapter: string,
# }
@log_exc(5)
def scrape_law(link):
    result = []

    response = requests.get(link)

    soup = BeautifulSoup(response.text, "html.parser")

    # check if 'vis hele dokumentet' exists  if it does, click it and get the new link if it doesn't, continue

    expand_button = soup.find("li", class_="complete")

    if expand_button and  "Vis hele dokumentet" in str(expand_button):
        expand_link = expand_button.find("a")["href"]
        response = requests.get(base + expand_link)
        soup = BeautifulSoup(response.text, "html.parser")


    # Get the title of the law, which is in a tag with the class  "document-title"
    law_name = soup.find(class_ =  "metaTitleText").text

    # Get all divs that has id starting with "kapittel_", and append to list
    chapters = soup.find_all('div', {'id': re.compile(r'^KAPITTEL_\d+$')})

    if len(chapters) == 0:
        result += get_all_paragraphs(soup, law_name, link)
    else:
        for chapter in chapters:
            # Get all divs that has id starting with "kapittel_", and append to list
            chapter_name = chapter.find("h2").text

            # TODO: find possible sub chapters and add to the paragraphs

            result += get_all_paragraphs(chapter, law_name, link, chapter_name)


    return result


def get_all_paragraphs(root, law_name, link, chapter_name=None):
    paragrafs = root.find_all('div', {'data-id': re.compile(r'^PARAGRAF_')})
    result = []

    for paragraf in paragrafs:
        paragraph_title = paragraf.find(class_= "paragrafHeader").text # TODO: you can further divide this to paragraph number and title

        paragraf_text = paragraf.text.replace("🔗Del paragraf", "").replace(paragraph_title, "").strip()
        # paragraf_name.extract()
        result.append({
            "law_name": law_name,
            "chapter": chapter_name,
            "paragraph_title": paragraph_title,
            "paragraph": paragraf_text,
            "url": link + "#" + paragraph_title.split(".")[0].replace(" ", "")
        })

    return result





def main():
    # Get all paragrafs from all articles and create a pandas dataframe
    offset = 0
    articles = []
    next_articles = click_next_page(offset)
    max_pages = 99999
    n = 0

    while next_articles and n < max_pages:
        n += 1
        offset += 20
        articles = articles + next_articles
        next_articles = click_next_page(offset)

    save_path = "test/all_lovdata.csv"

    start_index = 200
    paragraphs = []
    if start_index > 0:
        df = pd.read_csv(save_path)
        paragraphs = df.to_dict("records")
        print("Loaded from csv")



    paragraphs_lock = threading.Lock()
    def save_paragraphs(paragraphs):
        print("Length of paragraphs: " + str(len(paragraphs)))
        df = pd.DataFrame(paragraphs, columns=["url", "law_name", "chapter", "paragraph_title", "paragraph"])
        df.to_csv(save_path, index=True)
        print("Saved to csv")
    
    def scrape_and_append(i, articles, paragraphs, lock):
        article = articles[i]
        try:
            results = scrape_law(base + article)
            with lock:
                for result in results:
                    paragraphs.append(result)
        except Exception as e:
            print("Error scraping: " + article)
            print(e)

    multi_thread_list(input_list=articles, output_list=paragraphs, target=scrape_and_append, save=save_paragraphs, lock= paragraphs_lock, start_index=start_index, num_threads=10, save_every=100)
    


    # for article in articles:
    #     # Make try catch block
    #     try:
    #         paragraphs += scrape_law(base + article)
    #     except Exception as e:
    #         print("Error scraping: " + article)
    #         print(e)



    # Create a pandas dataframe with the result
    #df = pd.DataFrame(paragraphs, columns=["url", "law_name", "chapter", "paragraph_title", "paragraph"])

    #print(df)

    # Save the dataframe to a csv file
    #df.to_csv("test/all_lovdata.csv", index=True)

#print(get_lov_data(first_article)[0].text.strip())

if __name__ == "__main__":
    main()