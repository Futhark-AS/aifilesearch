import React from "react";
import { Layout } from "../components/Layout";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "@/components/Spinner";
import { Modal } from "@mantine/core";

export default function Authenticate() {
  const { isLoading } = useAuth();
  return (
    <Layout title="Authenticate">
      <h2 className="text-center text-2xl">Sign in with Google</h2>
      <div className="mt-10 flex h-20 w-full justify-center">
        <GoogleSignInButton />
      </div>
      <Modal
        opened={isLoading}
        onClose={() => {}}
        withCloseButton={false}
        centered
        styles={{modal: {backgroundColor: "transparent"}}}
      >
        <div className="h-64 flex items-center">
          <Spinner className="mx-auto" size="xl" />
        </div>
      </Modal>
    </Layout>
  );
}
