# test the endpoint http://localhost:7071/api/search
# request body:
# {
#     "prompt": "What is competitive advantage?",
#     "topK": 5,
#     "namespace": ""
#     "index_name": "michael"
# }


import requests
import json

def search(prompt, topK, namespace):
    url = "http://localhost:7071/api/query?id=jorgen.sandhaug@gmail.com"
    payload = json.dumps({
        "prompt": prompt,
        "topK": topK,
        "namespace": namespace,
    })
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    return response.text

print(search("What is competitive advantage?", 5, "hei"))