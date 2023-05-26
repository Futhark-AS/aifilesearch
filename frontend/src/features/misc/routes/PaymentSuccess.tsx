import { Button } from "@/components/Button";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = React.useState(0);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    const res = searchParams.get("credits");

    if (res == null) {
      navigate("/");
      return;
    }

    setCredits(parseInt(res));
  }, [location.search, navigate]);
  return (
    <div className="flex h-screen flex-col items-center p-16">
      <div className="mt-16">
        <h2 className="mb-6  dark:text-gray-600">
          <div className="text-center text-4xl font-extrabold">Success </div>
        </h2>
        <div className="text-md w-80 text-center">
          <span className="text-green-600">{credits} credits</span> have been
          added to your account. It might take a few minutes for the credits to
          appear in your account.
        </div>
        <Button
          className="mx-auto mt-4 rounded px-8 py-3 font-semibold"
          onClick={() => navigate("/app/projects")}
        >
          Home
        </Button>
      </div>
    </div>
  );
};
