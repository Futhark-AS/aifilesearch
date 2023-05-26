import { ContentLayout } from "@/components/Layout";
import React from "react";
import { BuyCredits } from "../components/BuyCredits";
import { useAuth } from "@/features/auth/hooks/useAuth";

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
  const { isLoading, user } = useAuth();

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
            <BuyCredits title="Buy Credits" />
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
    </ContentLayout>
  );
};
