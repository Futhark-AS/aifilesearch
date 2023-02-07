import { ContentLayout } from "@/components/Layout";
import React from "react";

import { useUser } from "@/redux/hooks";
import { UpdateProfile } from "../components/UpdateProfile";
import { useIsAuthenticated } from "../../../redux/hooks";

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
  const { firstName, email } = useUser();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) return null;

  return (
    <ContentLayout title="Profile">
      <div className="overflow-hidden mt-4 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              User Information
            </h3>
            <UpdateProfile />
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details of the user.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <Entry label="First Name" value={firstName} />
            <Entry label="Email Address" value={email} />
          </dl>
        </div>
      </div>
    </ContentLayout>
  );
};
