from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient
import json
import io

"""
Remember to remove the key from your code when you're done, and never post it publicly. For production, use
secure methods to store and access your credentials. For more information, see 
https://docs.microsoft.com/en-us/azure/cognitive-services/cognitive-services-security?tabs=command-line%2Ccsharp#environment-variables-and-application-configuration
"""
endpoint = "https://jorgen-receipt-recognizer.cognitiveservices.azure.com/"
key = "ce4f6273acf642888e33b283c7481323"

def format_bounding_box(bounding_box):
    if not bounding_box:
        return "N/A"
    return ", ".join(["[{}, {}]".format(p.x, p.y) for p in bounding_box])

def analyze_read(pdfs):
    document_analysis_client = DocumentAnalysisClient(
        endpoint=endpoint, credential=AzureKeyCredential(key)
    )
    # price is 1.5 dollars per 1000 pages
    p = 1.5
    print("Price per 1000 pages: " + str(p) + " dollars", end="\n\n")
    price = p*len(pdfs)*2/1000 # 2 pages per pdf
    print(f"Price for extracting text from {len(pdfs)} pdfs with total length {len(pdfs)*2} pages: {price} dollars", end="\n\n")
    # path = "folder/document_name-0-4.pdf"
    all_paragraphs = []
    for i in range(len(pdfs)):
        # pdf is of type PyPDF2.PdfReader
        pdf = pdfs[i][0]
        page_number_base = pdfs[i][1]
        blob_name = pdfs[i][2]

        buf = io.BytesIO()
        pdf.write(buf)
        buf.seek(0)
        poller = document_analysis_client.begin_analyze_document(
            "prebuilt-read", document=buf
        )
        result = poller.result()
        print("Document contains {} pages: ".format(len(result.pages)))

        print("----Languages detected in the document----")
        for language in result.languages:
            print("Language code: '{}' with confidence {}".format(language.locale, language.confidence))

        for paragraph in result.paragraphs:
            print(
                "...Paragraph of length'{}'".format(
                    len(paragraph.content)
                )
            )
            #print("...Bounding regions: {}".format(paragraph.bounding_regions))
            if len(paragraph.bounding_regions) > 1:
                # throw exception
                print("Error: more than one bounding region")

            all_paragraphs.append({
                "content": paragraph.content,
                "page_number": paragraph.bounding_regions[0].page_number + page_number_base,
                "file_name": blob_name,
                "bounding_box": [{"x": point.x, "y":point.y} for point in paragraph.bounding_regions[0].polygon]
            })

            
    return all_paragraphs, price