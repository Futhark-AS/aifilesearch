import React, { useState } from "react";
import { Button } from "@/components/Button";
import { TextInput } from "@mantine/core";

// take in onsubmit in interface
interface Props {
  onSubmit(credits: number): void;
}

export const BuyCreditsForm = ({ onSubmit }: Props) => {
  const [credits, setCredits] = useState<string | number>("");
  const [price, setPrice] = useState<string | number>("");

  const creditToPrice = (credits: number) => credits * 0.01;
  const priceToCredit = (price: number) => price / 0.01;

  return (
    <div className="flex h-64 flex-col items-center">
      <span className="text-2xl font-bold">Buy Credits</span>
      <form
        id="buy-credits"
        className="mt-4 w-64"
        onSubmit={async (e) => {
          e.preventDefault();
          onSubmit(e.currentTarget.value);
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
            setPrice(creditToPrice(value));
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
            setCredits(priceToCredit(value));
          }}
          type="text"
          value={price}
        />
      </form>
      <Button form="buy-credits" type="submit" className="mt-4">Buy</Button>
    </div>
  );
};
