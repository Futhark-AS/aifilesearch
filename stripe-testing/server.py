import json
import os
import stripe
from webhook import handle_webhook
import logging

from flask import Flask, jsonify, request

# The library needs to be configured with your account's secret key.
# Ensure the key is kept out of any version control system you might be using.
stripe.api_key = "sk_test_51MePU5JR76QyQ6AvVNTJ2VRD61t0hxnLt4JclIcGOPPXoKfWz3MTvmliFSEweT0Ajn8vY2mbljFcRMrxNOPtvspy00brEE1qkh"
# This is your Stripe CLI webhook secret for testing your endpoint locally.
endpoint_secret = 'whsec_c1445315ec79b81ca3753373cb4a759015b1e3b79355c99dc1a77972d16f06d2'

app = Flask(__name__)

# info logging
logging.basicConfig(level=logging.INFO)

@app.route('/webhook', methods=['POST'])
def webhook():
    event = None
    payload = request.data
    sig_header = request.headers['STRIPE_SIGNATURE']

    logging.info("HEADER")
    logging.info(sig_header)

    handle_webhook(payload, sig_header, endpoint_secret)

    return jsonify(success=True)

if __name__ == '__main__':
    app.run(port=4242)
    print("Running on port 4242")