from azure.core.credentials import AzureKeyCredential
import uuid
import requests
import json

endpoint = "https://api.cognitive.microsofttranslator.com/translate"
credential ="5fa90e6892384a37942a3151d645b271"
# send the request to the endpoint
headers = {
    'Ocp-Apim-Subscription-Key': credential,
    'Ocp-Apim-Subscription-Region': 'westeurope',
    'Content-type': 'application/json',
    'X-ClientTraceId': str(uuid.uuid4())
}
params = {
    'api-version': '3.0',
    'from': 'no',
    'to': 'en'
}
def translate_text(text):
    body = [{
        'text': text
    }]
    response = requests.post(endpoint, headers=headers, params=params, data=json.dumps(body))
    return response.json()[0]['translations'][0]['text']