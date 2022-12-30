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
    end = 50
    for i in range(start, end, n):
        path = "michael_pages/michael-%s-%s.pdf" % (i, i+n-1)
        print(path)

        with open(path, "rb") as f:
            poller = document_analysis_client.begin_analyze_document(
                "prebuilt-read", document=f
            )
        result = poller.result()
        print("Document contains {} pages: ".format(len(result.pages)))

        # add all pages to file
        with open("michael_pages/michael-%s-%s.txt" % (i, i+n-1), "w") as f:
            f.write(result.content)
            f.write("\n\n")
        

        #print ("Document contains content: ", result.content)

        # save content to file

        
        # for idx, style in enumerate(result.styles):
        #     print(
        #         "Document contains {} content".format(
        #             "handwritten" if style.is_handwritten else "no handwritten"
        #         )
        #     )

        # for page in result.pages:
        #     print("----Analyzing Read from page #{}----".format(page.page_number))
        #     print(
        #         "Page has width: {} and height: {}, measured with unit: {}".format(
        #             page.width, page.height, page.unit
        #         )
        #     )

        #     for line_idx, line in enumerate(page.lines):
        #         print(
        #             "...Line # {} has text content '{}' within bounding box '{}'".format(
        #                 line_idx,
        #                 line.content,
        #                 format_bounding_box(line.polygon),
        #             )
        #         )

        #     for word in page.words:
        #         print(
        #             "...Word '{}' has a confidence of {}".format(
        #                 word.content, word.confidence
        #             )
        #         )

        # print("----------------------------------------")


if __name__ == "__main__":
    analyze_read()
