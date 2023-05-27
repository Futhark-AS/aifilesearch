import { Spinner } from "@/components/Spinner";
import { Modal } from "@mantine/core";
import React from "react";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/useAuth";

export default function Authenticate() {
  const { isLoading } = useAuth();
  return (
    <Layout title="Authenticate">
      <h2 className="text-center text-2xl">Authenticate with Google</h2>
      <div className="mt-10 flex h-20 w-full flex-col items-center justify-center">
        <GoogleSignInButton />
        <span className="mt-4 text-center text-xs italic text-gray-500">
          By authenticating yourself, you agree to our{" "}
          {
            <a
              href="https://www.termsandconditionsgenerator.com/live.php?token=796ovcAXOBXabYCJacVGj4wf9ucyyMR1"
              className="text-blue-400"
            >
              Terms of Service
            </a>
          }{" "}
          and acknowledge that you have read our{" "}
          {
            <a
              href="https://www.privacypolicygenerator.info/live.php?token=UbQfp2wavpr5zO8n07mP0sWOhGWW5pQR"
              className="text-blue-400"
            >
              Privacy Policy
            </a>
          }
          .
        </span>
      </div>
      <Modal
        opened={isLoading}
        onClose={() => {}}
        withCloseButton={false}
        centered
        styles={{ modal: { backgroundColor: "transparent" } }}
      >
        <div className="flex h-64 items-center">
          <Spinner className="mx-auto" size="xl" />
        </div>
      </Modal>
    </Layout>
  );
}
