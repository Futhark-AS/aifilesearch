from dotenv import load_dotenv

load_dotenv()
import logging
import stripe
from azure.cosmos import CosmosClient
import os


# log info logging
logging.basicConfig(level=logging.INFO)


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
    print(payload)
    event = None

    print("incoming webhook")

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

        # set uid and credits on payment_intent manually
        payment_intent['metadata']['uid'] = "sid:eb29ffbd4835f17f59814309696889de"
        payment_intent['metadata']['credits'] = "400"

        uid = payment_intent['metadata']['uid']
        credits = int(payment_intent['metadata']['credits'])
        update_user_credits(uid, credits)

    else:
      print('Unhandled event type {}'.format(event['type']))