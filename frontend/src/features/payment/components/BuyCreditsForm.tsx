import { Button } from "@/components/Button";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { Divider } from "@mantine/core";
import React, { useState } from "react";

// take in onsubmit in interface
interface Props {
  onSubmit(credits: number): void;
}

export const creditToPrice = (credits: number) =>
  credits * import.meta.env.VITE_DOLLAR_TO_CREDIT;

const MIN_CREDITS = 100;

export const BuyCreditsForm = ({ onSubmit }: Props) => {
  const [credits, setCredits] = useState<number>(MIN_CREDITS);
  const [price, setPrice] = useState<number>(creditToPrice(MIN_CREDITS));

  const STEP_SIZE = 50;

  const incrementCredits = () => {
    const newCredits = Number(credits) + STEP_SIZE;
    setCredits(newCredits);
    setPrice(creditToPrice(newCredits));
  };

  const decrementCredits = () => {
    if (Number(credits) >= MIN_CREDITS + STEP_SIZE) {
      const newCredits = Number(credits) - STEP_SIZE;
      setCredits(newCredits);
      setPrice(creditToPrice(newCredits));
    }
  };

  return (
    <div className="flex h-64 flex-col">
      <form
        id="buy-credits"
        className="mx-auto mt-4 flex w-64 flex-col items-center"
        onSubmit={async (e) => {
          e.preventDefault();
          onSubmit(credits);
        }}
      >
        <div className="text-center text-lg">
          <span className="font-bold">{credits}</span> credits
        </div>
        <div className="text-md text-gray mt-4 text-center italic">
          {price}$ USD
        </div>
        <Divider className="mt-4 w-full" />
        <div className="mt-4 flex justify-center">
          <MinusCircleIcon
            className="h-8 w-8 hover:cursor-pointer"
            onClick={() => decrementCredits()}
          />
          <div className="mx-2 w-6 select-none text-center text-lg font-normal">
            {credits / STEP_SIZE - 1}
          </div>
          <PlusCircleIcon
            className="h-8 w-8 hover:cursor-pointer"
            onClick={() => incrementCredits()}
          />
        </div>
      </form>
      <Button
        form="buy-credits"
        type="submit"
        className="mx-auto mt-4 block w-40"
        variant="inverse"
      >
        Buy Credits
      </Button>
    </div>
  );
};
