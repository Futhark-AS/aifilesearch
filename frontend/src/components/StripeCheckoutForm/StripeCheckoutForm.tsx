import React, { FormEvent, useEffect, useState } from "react";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { StripePaymentElementOptions, loadStripe } from "@stripe/stripe-js";
import { isProd } from "@/utils/general";

const stripePromise = loadStripe(
  isProd
    ? "pk_live_51MePU5JR76QyQ6AvL89IwWk9yYLIH3ERANOGGCWgJOYeNCLe3gZkc610rqRQazf2anIVB5wz3ob05zleH0q4I1Jy00bztowdqI"
    : "pk_test_51MePU5JR76QyQ6Avy732ksgL17hzuDKNXVtI9zpBJrwzfcsshlp9QnygfuaVTKRptbjxts9V6GB1AQEmkacsYdq400LvhshcA4"
);

interface Props {
  paymentIntentClientSecret: string;
  successURL: string;
}

export const StripeCheckoutForm = ({
  paymentIntentClientSecret,
  successURL,
}: Props) => {
  const appearance = {
    theme: "stripe",
  } as const;

  const options = {
    clientSecret: paymentIntentClientSecret,
    appearance,
  } as const;

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        paymentIntentClientSecret={paymentIntentClientSecret}
        successURL={successURL}
      />
    </Elements>
  );
};

function CheckoutForm({ paymentIntentClientSecret, successURL }: Props) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!paymentIntentClientSecret) {
      return;
    }

    stripe
      .retrievePaymentIntent(paymentIntentClientSecret)
      .then(({ paymentIntent }) => {
        if (!paymentIntent) return setMessage("Something went wrong");
        switch (paymentIntent.status) {
          case "succeeded":
            setMessage("Payment succeeded!");
            break;
          case "processing":
            setMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            setMessage("");
            break;
          default:
            setMessage("Something went wrong.");
            break;
        }
      });
  }, [stripe]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: successURL,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message ?? "An unexpected error occurred.");
    } else {
      setMessage("An unexpected error occurred.");
    }

    // TODO: error notification
    setIsLoading(false);
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    paymentMethodOrder: ["card"],
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} />

      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}
