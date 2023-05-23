import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import axios from "axios";
import Stripe from "stripe";
import { z } from "zod";
import { createResponse } from "./common";

// read from env
const DOLLAR_TO_CREDIT = Number(process.env["ENV_DOLLAR_TO_CREDIT"]);
const STRIPE_SECRET_KEY = process.env["ENV_STRIPE_SECRET_KEY"];
const FREECURRENCYAPI_KEY = process.env["ENV_FREECURRENCYAPI_API_KEY"];

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// Example response:
// {
//   "data": {
//     "EUR": 0.916442,
//     "USD": 1,
//   }
// }
// https://api.freecurrencyapi.com/v1/latest?apikey=xxx
const usdToEur = async () => {
  const schema = z.object({
    data: z.object({
      USD: z.number(),
      EUR: z.number(),
    }),
  });
  const response = await axios.get(
    `https://api.freecurrencyapi.com/v1/latest?apikey=${FREECURRENCYAPI_KEY}`
  );

  const resp = schema.safeParse(response.data);

  if (resp.success) {
    return resp.data.data.EUR;
  } else {
    // Default to 1 in rate conversion if the API fails
    return 1;
  }
};

// Take the number of credits and convert to EUR cents
const calculateOrderAmount = async (credits: number) => {
  const usd = credits / DOLLAR_TO_CREDIT;

  const rate = await usdToEur();
  const eur = usd * rate;

  const cents = eur * 100;
  const centsWhole = Math.round(cents);

  return centsWhole;
};

// create a new payment intent and return the client secret
const createPaymentIntent = async (credits: number, uid: string) => {
  const amount = await calculateOrderAmount(credits);
  return stripe.paymentIntents.create({
    amount,
    currency: "eur",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      uid: uid,
      credits: credits,
    },
  });
};

const extractRequestData = (req: HttpRequest) => {
  const requestSchema = z
    .object({
      headers: z.object({
        "x-ms-client-principal-id": z.string(),
      }),
      body: z.object({
        credits: z.number(), // number of credits to buy
      }),
    })
    .transform((data) => {
      return {
        uid: data.headers["x-ms-client-principal-id"],
        credits: data.body.credits,
      };
    });

  const parsed = requestSchema.parse(req);
  return parsed;
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");
  context.log(JSON.stringify(req, null, 2))

  try {
    const reqData = extractRequestData(req);

    // create payment intent
    const paymentIntent = await createPaymentIntent(
      reqData.credits,
      reqData.uid
    );

    createResponse(context, 200, {
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    const err = JSON.stringify(
      Object.assign({}, error, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    );

    createResponse(
      context,
      500,
      "An error occurred while getting projects" + err
    );
  }
};

export default httpTrigger;
