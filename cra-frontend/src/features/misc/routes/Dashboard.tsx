import { ContentLayout } from "@/components/Layout";
import React from "react";

export const Dashboard: React.FC = () => {
  // const isAuthenticated = useIsAuthenticated();
  // const user = useUser();

  // if (!isAuthenticated) return <div>You are not authenticated</div>;

  return (
    <ContentLayout title="Dashboard">
      <h1 className="mt-2 text-xl">
        {/* Welcome <b>{`${user?.firstName}`}</b> */}
      </h1>
      <h4 className="my-3">Your role is : NONE</h4>
      <p className="font-medium">In this application you can:</p>
      <ul className="my-4 list-inside list-disc">
        <li>Create comments in discussions</li>
        <li>Delete own comments</li>
      </ul>
    </ContentLayout>
  );
};
