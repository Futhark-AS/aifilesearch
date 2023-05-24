import { ContentLayout } from "@/components/Layout";
import React, { useEffect } from "react";

import { getUser } from "@/features/projects/requests";
import { useUser } from "@/redux/hooks";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { useIsAuthenticated } from "../../../redux/hooks";
import { BuyCredits } from "../components/BuyCredits";
import { useAppDispatch } from "@/redux/hooks";
import { setUserCredits } from "@/features/auth/authSlice";

import { showNotification } from "@mantine/notifications";

type EntryProps = {
  label: string;
  value: string;
};
const Entry = ({ label, value }: EntryProps) => (
  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
      {value}
    </dd>
  </div>
);

export const Profile = () => {
  const { email, name } = useUser();
  const isAuthenticated = useIsAuthenticated();
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
  });

  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isSuccess = searchParams.get("success");
    const credits = searchParams.get("credits");

    if (isSuccess && credits) {
      const newCredits = user?.credits
        ? user.credits + parseInt(credits)
        : parseInt(credits);

      showNotification({
        title: "Payment successful!",
        message:
          "You have bought " +
          credits +
          " credits. They will be added to your account shortly. Thank you for your purchase!",
        color: "teal",
      });

      dispatch(
        setUserCredits({
          credits: newCredits,
        })
      );

      console.log(location.pathname);
      history.pushState(null, "", location.pathname);
    }
  }, [location]);

  if (!isAuthenticated) return null;

  const formatCredits = (credits: undefined | number): string => {
    if (credits === undefined) {
      return "Could not get credits";
    } else {
      return Math.floor(credits).toString();
    }
  };

  return (
    <ContentLayout title="Profile">
      <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium text-gray-900">Balance</h3>
            <BuyCredits />
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <Entry
              label="Credits left"
              value={isLoading ? "Loading..." : formatCredits(user?.credits)}
            />
          </dl>
        </div>
      </div>
      <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              User Information
            </h3>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your profile information.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <Entry label="Name" value={name || "None"} />
            <Entry label="Email Address" value={email || "None"} />
          </dl>
        </div>
      </div>
    </ContentLayout>
  );
};
