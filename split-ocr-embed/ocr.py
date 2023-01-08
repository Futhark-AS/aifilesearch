"""
This code sample shows Prebuilt Read operations with the Azure Form Recognizer client library. 
The async versions of the samples require Python 3.6 or later.

To learn more, please visit the documentation - Quickstart: Form Recognizer Python client library SDKs
https://docs.microsoft.com/en-us/azure/applied-ai-services/form-recognizer/quickstarts/try-v3-python-sdk
"""

from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient

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

def analyze_read():
    # sample document
    #formUrl = "https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/sample-layout.pdf"

    document_analysis_client = DocumentAnalysisClient(
        endpoint=endpoint, credential=AzureKeyCredential(key)
    )
    # path = "folder/document_name-0-4.pdf"
    n = 2
    start = 15
    end = 18

    p = 1.5
    print("Price per 1000 pages: " + p + " dollars", end="\n\n")
    price = p*(end-start)/1000
    print("Price for extracting text from %s to %s pages: %s dollars" % (start, end, price), end="\n\n")

    for i in range(start, end, n):
        path = "michael_pages/michael-%s-%s.pdf" % (i, i+n-1)
        print(path)

        with open(path, "rb") as f:
            poller = document_analysis_client.begin_analyze_document(
                "prebuilt-read", document=f
            )
        result = poller.result()
        print("Document contains {} pages: ".format(len(result.pages)))

        print("----Languages detected in the document----")
        for language in result.languages:
            print("Language code: '{}' with confidence {}".format(language.locale, language.confidence))

        for page in result.pages:
            print("----Analyzing Read from page #{}----".format(i + page.page_number))
            print(
                "Page has width: {} and height: {}, measured with unit: {}".format(
                    page.width, page.height, page.unit
                )
            )
            # concat all lines
            page.content = ".PAGE_NUMBER_DECLARATION " + str(i + page.page_number)+"." 
            for line in page.lines:
                page.content += line.content + "\n"
            # add all pages to file
            with open("michael_pages/michael-%s-%s.txt" % (i, i+n-1), "w") as f:
                f.write(page.content)
                f.close()

if __name__ == "__main__":
    analyze_read()
