import React from "react";


import { Button } from "@/components/Button";
import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";

export const successURL = (credits: number) =>
  import.meta.env.VITE_PROD == "1"
    ? import.meta.env.VITE_PROD_URL +
      `payment-success?credits=${credits}`
    : import.meta.env.VITE_DEV_URL +
      `payment-success?credits=${credits}`;

// custom trigger button
interface Props {
  clientSecret: string;
  credits: number;
}

export const PopupModalStripeCheckout = ({ clientSecret, credits }: Props) => {
  return (
    <div>
      <StripeCheckoutForm
        paymentIntentClientSecret={clientSecret}
        successURL={successURL(credits)}
      />
      <div className="flex">
        <Button form="payment-form" type="submit" size="sm" variant="gray">
          Back
        </Button>
        <Button form="payment-form" type="submit" size="sm" className="flex-1">
          Complete Payment
        </Button>
      </div>
    </div>
  );
};
