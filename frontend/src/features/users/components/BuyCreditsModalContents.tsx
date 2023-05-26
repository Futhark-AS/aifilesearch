import { creditsPaymentIntent } from "@/features/projects/requests";
import { Table } from "@mantine/core";
import React, { useState } from "react";
import { BuyCreditsForm, creditToPrice } from "./BuyCreditsForm";
import { PopupModalStripeCheckout } from "./StripePayment";

// Payment SUmmary component

const PaymentSummary = ({
  credits,
  price,
}: {
  credits: number;
  price: number;
}) => {
  return (
    <Table fontSize={"xs"}>
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{credits} credits</td>
          <td>${price}</td>
        </tr>
      </tbody>
    </Table>
  );
};

export const BuyCreditsModalContents = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [credits, setCredits] = useState<number>(0);

  return (
    <div>
      {clientSecret ? (
        <div>
          <h4 className="mb-4 text-lg font-semibold">Payment Summary</h4>
          <PaymentSummary credits={credits} price={creditToPrice(credits)} />
          <h4 className="mb-4 mt-8 text-lg font-semibold">Payment Method</h4>
          <PopupModalStripeCheckout
            credits={credits}
            clientSecret={clientSecret}
          />
        </div>
      ) : (
        <BuyCreditsForm
          onSubmit={async (data) => {
            setCredits(data);
            const creditsPaymentIntentSecret = await creditsPaymentIntent(
              Number(data)
            );
            setClientSecret(creditsPaymentIntentSecret.clientSecret);
            console.log(data);
          }}
        />
      )}
    </div>
  );
};
