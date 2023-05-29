import React from "react";

import { Button } from "@/components/Button";
import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";
import { isProd } from "@/utils/general";

export const successURL = (credits: number) =>
  isProd
    ? import.meta.env.VITE_PROD_URL + `/payment-success?credits=${credits}`
    : import.meta.env.VITE_DEV_URL + `/payment-success?credits=${credits}`;

// custom trigger button
interface Props {
  clientSecret: string;
  credits: number;
  onBack(): void;
}

export const PopupModalStripeCheckout = ({
  clientSecret,
  credits,
  onBack,
}: Props) => {
  return (
    <div>
      <StripeCheckoutForm
        paymentIntentClientSecret={clientSecret}
        successURL={successURL(credits)}
      />
      <div className="flex">
        <Button
          onClick={onBack}
          size="sm"
          variant="gray"
        >
          Back
        </Button>
        <Button form="payment-form" type="submit" size="sm" className="flex-1">
          Complete Payment
        </Button>
      </div>
    </div>
  );
};
