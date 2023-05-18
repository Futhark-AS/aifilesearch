import React, { useState } from "react";

import { Button } from "@/components/Button";
import { FormDrawer } from "@/components/Form";

import { PencilIcon } from "@heroicons/react/24/outline";
import { loadStripe } from "@stripe/stripe-js";
import { useUpdateProfile } from "../api/updateProfile";

import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";
import { creditsPaymentIntent } from "@/features/projects/requests";
import { Elements } from "@stripe/react-stripe-js";

import { TextInput } from "@mantine/core";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(
  "pk_test_51MePU5JR76QyQ6Avy732ksgL17hzuDKNXVtI9zpBJrwzfcsshlp9QnygfuaVTKRptbjxts9V6GB1AQEmkacsYdq400LvhshcA4"
  // "pk_live_51MePU5JR76QyQ6AvL89IwWk9yYLIH3ERANOGGCWgJOYeNCLe3gZkc610rqRQazf2anIVB5wz3ob05zleH0q4I1Jy00bztowdqI"
);

export const BuyCredits = () => {
  const [clientSecret, setClientSecret] = useState("");
  const updateProfileMutation = useUpdateProfile();
  const [credits, setCredits] = useState(0);

  const appearance = {
    theme: "stripe",
  } as const;
  const options = {
    clientSecret,
    appearance,
  } as const;

  return (
    <FormDrawer
      isDone={updateProfileMutation.isSuccess}
      triggerButton={
        <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
          Buy Credits
        </Button>
      }
      title="Update Profile"
      submitButton={
        clientSecret ? (
          <Button
            form="payment-form"
            type="submit"
            size="sm"
            isLoading={updateProfileMutation.isLoading}
          >
            Confirm Payment
          </Button>
        ) : (
          <Button
            form="buy-credits"
            type="submit"
            size="sm"
            isLoading={updateProfileMutation.isLoading}
          >
            Check out
          </Button>
        )
      }
    >
      <form
        id="buy-credits"
        onSubmit={async (e) => {
          e.preventDefault();
          const creditsPaymentIntentSecret = await creditsPaymentIntent(
            Number(credits)
          );
          setClientSecret(creditsPaymentIntentSecret.clientSecret);
        }}
      >
        {!clientSecret && (
          <TextInput
            label="Credits"
            onChange={(e) => {
              setCredits(Number(e.currentTarget.value));
            }}
            type="number"
          />
        )}
      </form>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <StripeCheckoutForm
            successURL={`http://localhost:5173/app/profile?success=true&credits=${credits}`}
            paymentIntentClientSecret={clientSecret}
          />
        </Elements>
      )}

      {/* Show cost of credits, pretty */}
      <div className="mt-2">
        <p className="">
          {credits} credits = ${credits * 0.01}
        </p>
      </div>
    </FormDrawer>
  );
};
