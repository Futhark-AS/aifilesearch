import { creditsPaymentIntent } from "@/features/projects/requests";
import React, { useState } from "react";
import { BuyCreditsForm, creditToPrice } from "./BuyCreditsForm";
import { PopupModalStripeCheckout } from "./StripePayment";
import { PaymentSummary } from "./PaymentSummary";
import { showError } from "@/utils/showError";
import { useOpenBuyCredits } from "@/features/misc/useOpenBuyCredits";

export const BuyCreditsModalContents = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [checkedOutCredits, setCheckedOutCredits] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const { close } = useOpenBuyCredits();

  const goBack = () => setCurrentStep((current) => current - 1);
  const goForward = () => setCurrentStep((current) => current + 1);

  const onSubmitBuyCredits = async (credits: number) => {
    setCheckedOutCredits(credits);
    try {
      const creditsPaymentIntentSecret = await creditsPaymentIntent(credits);
      setClientSecret(creditsPaymentIntentSecret.clientSecret);
      goForward();
    } catch (error) {
      console.error(error);
      close();
      showError("Internal server error. Please try again later.");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BuyCreditsForm onSubmit={onSubmitBuyCredits} />;
      case 1:
        return (
          <div>
            <h4 className="mb-4 text-lg font-semibold">Payment Summary</h4>
            <PaymentSummary
              credits={checkedOutCredits}
              price={creditToPrice(checkedOutCredits)}
            />
            <h4 className="mb-4 mt-8 text-lg font-semibold">Payment Method</h4>
            <PopupModalStripeCheckout
              credits={checkedOutCredits}
              clientSecret={clientSecret}
              onBack={goBack}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return renderStep();
};
