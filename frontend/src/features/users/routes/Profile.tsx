import { Button } from "@/components/Button";
import { ContentLayout } from "@/components/Layout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOpenBuyCredits } from "@/features/misc/useOpenBuyCredits";
import { PencilIcon } from "@heroicons/react/24/outline";
import React from "react";

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
  const { open } = useOpenBuyCredits();

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
            <Button
              startIcon={<PencilIcon className="h-4 w-4" />}
              size="sm"
              onClick={open}
            >
              Buy Credits
            </Button>
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
