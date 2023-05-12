import logging
import stripe
from azure.cosmos import CosmosClient
import os

import azure.functions as func

#----------- COsmos DB ----------
cosmos_endpoint = "https://nlpcosmos.documents.azure.com:443/"
cosmos_key = os.getenv("ENV_COSMOS_KEY")
cosmos_client = CosmosClient(url=cosmos_endpoint, credential=cosmos_key)
logging.info("Cosmos DB client created")
cosmos_database = cosmos_client.get_database_client("nlp-search") 
cosmos_container = cosmos_database.get_container_client("users")

#----------- Stripe ----------
stripe.api_key = os.getenv("ENV_STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("ENV_STRIPE_WEBHOOK_SECRET")

def update_user_credits(user_id, credits_to_buy):
    user = cosmos_container.read_item(item=user_id, partition_key=user_id)
    user_credits = user["credits"]
    logging.info(f"User has {user_credits} credits")

    # subtract price from user credits
    user["credits"] = user_credits + credits_to_buy

    cosmos_container.upsert_item(user)
    logging.info(f"User now has {user['credits']} credits, after buying {credits_to_buy} credits")

def handle_webhook(payload, sig, endpoint_secret):
    event = None


    try:
        event = stripe.Webhook.construct_event(
            payload, sig, endpoint_secret
        )
    except ValueError as e:
        logging.info("Invalid payload {}".format(e))
        # Invalid payload
        raise e
    except stripe.error.SignatureVerificationError as e:
        logging.info("Invalid signature {}".format(e))
        # Invalid signature
        raise e

    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']

        uid = payment_intent['metadata']['uid']
        credits = int(payment_intent['metadata']['credits'])
        update_user_credits(uid, credits)

    else:
      logging.info('Unhandled event type {}'.format(event['type']))


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    # loop over all the headers and print them
    logging.info(req.headers.__dict__)
    
    logging.info(req.get_json())

    try:
        req_body = req.get_body()
        sig = req.headers.get('stripe-signature')

        logging.info("sig is " + sig)

        handle_webhook(req_body, sig, WEBHOOK_SECRET)

        return func.HttpResponse("Webhook received", status_code=200)

    except Exception as e:
        logging.info("Error in webhook", exc_info=True)

        return func.HttpResponse(
                "Error in webhook " + str(e),
                status_code=400
            )