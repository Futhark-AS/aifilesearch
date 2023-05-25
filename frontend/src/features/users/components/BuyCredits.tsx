import React, { useState } from "react";

import { Button } from "@/components/Button";
import { FormDrawer } from "@/components/Form";

import { PencilIcon } from "@heroicons/react/24/outline";
import { loadStripe } from "@stripe/stripe-js";

import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";
import { creditsPaymentIntent } from "@/features/projects/requests";
import { Elements } from "@stripe/react-stripe-js";

import { TextInput } from "@mantine/core";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(
  "pk_live_51MePU5JR76QyQ6AvL89IwWk9yYLIH3ERANOGGCWgJOYeNCLe3gZkc610rqRQazf2anIVB5wz3ob05zleH0q4I1Jy00bztowdqI"
);

const successURL = (credits: number) =>
  import.meta.env.VITE_PROD == "1"
    ? import.meta.env.VITE_PROD_URL +
      `/app/profile?success=true&credits=${credits}`
    : import.meta.env.VITE_DEV_URL +
      `/app/profile?success=true&credits=${credits}`;

// custom trigger button
interface Props {
  btn?: React.ReactElement;
  title: string;
}

export const BuyCredits = ({ btn, title }: Props) => {
  const [clientSecret, setClientSecret] = useState("");
  const [credits, setCredits] = useState<string | number>("");
  const [price, setPrice] = useState<string | number>("");

  const appearance = {
    theme: "stripe",
  } as const;
  const options = {
    clientSecret,
    appearance,
  } as const;

  return (
    <FormDrawer
      isDone={false}
      triggerButton={
        btn == null ? (
          <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
            Buy Credits
          </Button>
        ) : (
          btn
        )
      }
      title={title}
      submitButton={
        clientSecret ? (
          <Button form="payment-form" type="submit" size="sm">
            Confirm Payment
          </Button>
        ) : (
          <Button form="buy-credits" type="submit" size="sm">
            Check out
          </Button>
        )
      }
    >
      {!clientSecret && (
        <div className="h-full flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">Buy Credits</span>
          <form
            id="buy-credits"
            className="w-64 mt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const creditsPaymentIntentSecret = await creditsPaymentIntent(
                Number(credits)
              );
              setClientSecret(creditsPaymentIntentSecret.clientSecret);
            }}
          >
            <TextInput
              label="Credits"
              onChange={(e) => {
                if (isNaN(Number(e.currentTarget.value))) {
                  setCredits("");
                  setPrice("");
                  return;
                }
                const value = Number(e.currentTarget.value);
                setCredits(value);
                setPrice(value * 0.01);
              }}
              value={credits}
              type="text"
            />
            <TextInput
              label="Price"
              onChange={(e) => {
                if (isNaN(Number(e.currentTarget.value))) {
                  setCredits("");
                  setPrice("");
                  return;
                }
                const value = Number(e.currentTarget.value);
                setPrice(value);
                setCredits(value / 0.01);
              }}
              type="text"
              value={price}
            />
          </form>
        </div>
      )}
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <StripeCheckoutForm
            successURL={successURL(Number(credits))}
            paymentIntentClientSecret={clientSecret}
          />
        </Elements>
      )}

      {/* Show cost of credits, pretty */}

      {/* <div className="mt-2">
        <p className="">
          {credits} credits = ${credits * 0.01}
        </p>
      </div> */}
    </FormDrawer>
  );
};
