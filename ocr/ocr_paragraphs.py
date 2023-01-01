"""
This code sample shows Prebuilt Read operations with the Azure Form Recognizer client library. 
The async versions of the samples require Python 3.6 or later.

To learn more, please visit the documentation - Quickstart: Form Recognizer Python client library SDKs
https://docs.microsoft.com/en-us/azure/applied-ai-services/form-recognizer/quickstarts/try-v3-python-sdk
"""

from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient
import json

"""
Remember to remove the key from your code when you're done, and never post it publicly. For production, use
secure methods to store and access your credentials. For more information, see 
https://docs.microsoft.com/en-us/azure/cognitive-services/cognitive-services-security?tabs=command-line%2Ccsharp#environment-variables-and-application-configuration
"""
endpoint = "https://jorgen-receipt-recognizer.cognitiveservices.azure.com/"
key = "ce4f6273acf642888e33b283c7481323"
n = 2
start = 15
end = 50
save_folder = "michael_pages"
file_name = "michael"

def format_bounding_box(bounding_box):
    if not bounding_box:
        return "N/A"
    return ", ".join(["[{}, {}]".format(p.x, p.y) for p in bounding_box])

def analyze_read():
    # sample document
    #formUrl = "https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/sample-layout.pdf"

    document_analysis_client = DocumentAnalysisClient(
        endpoint=endpoint, credential=AzureKeyCredential(key)
    )
    # price is 1.5 dollars per 1000 pages
    p = 1.5
    print("Price per 1000 pages: " + str(p) + " dollars", end="\n\n")
    price = p*(end-start)/1000
    print("Price for extracting text from %s to %s pages: %s dollars" % (start, end, price), end="\n\n")
    # path = "folder/document_name-0-4.pdf"
    all_paragraphs = []
    for i in range(start, end, n):
        path = save_folder+"/"+file_name+"-%s-%s.pdf" % (i, i+n-1)
        # print now handling file
        print("Handling file: " + path)


        with open(path, "rb") as f:
            poller = document_analysis_client.begin_analyze_document(
                "prebuilt-read", document=f
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
            print("...Bounding regions: {}".format(paragraph.bounding_regions))
            if len(paragraph.bounding_regions) > 1:
                # throw exception
                print("Error: more than one bounding region")
            all_paragraphs.append({
                "content": paragraph.content,
                "page_number": paragraph.bounding_regions[0].page_number + i,
                "bounding_box": [{"x": point.x, "y":point.y} for point in paragraph.bounding_regions[0].polygon]
            })

            
    return all_paragraphs
    



if __name__ == "__main__":
    all_paragraphs = analyze_read()
    path = save_folder+"/"+file_name+"-%s-%s.json" % (start, end)
    with open(path, "w") as f:
        json.dump(all_paragraphs, f)
