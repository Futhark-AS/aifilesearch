import React, { useState } from "react";

import { Button } from "@/components/Button";
import { FormDrawer } from "@/components/Form";

import { PencilIcon } from "@heroicons/react/24/outline";

import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";
import { creditsPaymentIntent } from "@/features/projects/requests";

import { TextInput } from "@mantine/core";
import { successURL } from "./StripePayment";

interface Props {
  btn?: React.ReactElement;
  title: string;
}

export const BuyCredits = ({ btn, title }: Props) => {
  const [clientSecret, setClientSecret] = useState("");
  const [credits, setCredits] = useState<string | number>("");
  const [price, setPrice] = useState<string | number>("");

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
        <div className="flex h-full flex-col items-center justify-center">
          <span className="text-2xl font-bold">Buy Credits</span>
          <form
            id="buy-credits"
            className="mt-4 w-64"
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
        <StripeCheckoutForm
          paymentIntentClientSecret={clientSecret}
          successURL={successURL(Number(credits))}
        />
      )}
    </FormDrawer>
  );
};
