import React from "react";

import { loadStripe } from "@stripe/stripe-js";

import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";
import { Elements } from "@stripe/react-stripe-js";
import { Button } from "@/components/Button";

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
  clientSecret: string;
  credits: number;
}

export const StripePayment = ({ clientSecret, credits }: Props) => {
  const appearance = {
    theme: "stripe",
  } as const;
  const options = {
    clientSecret,
    appearance,
  } as const;

  return (
    <div>
      <Elements options={options} stripe={stripePromise}>
        <StripeCheckoutForm
          successURL={successURL(Number(credits))}
          paymentIntentClientSecret={clientSecret}
        />
      </Elements>
      <div className="flex">
      <Button form="payment-form" type="submit" size="sm" variant="gray">Back</Button>
      <Button form="payment-form" type="submit" size="sm" className="flex-1">
      Complete Payment
      </Button>

      </div>
    </div>
  );
};
