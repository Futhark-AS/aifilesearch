import React from "react";
import { Layout } from "../components/Layout";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function Authenticate() {
  return (
    <Layout title="Authenticate">
      <h2 className="text-center text-2xl">Sign in with Google</h2>
      <div className="mt-10 flex w-full justify-center h-20">
        <GoogleSignInButton />
      </div>
    </Layout>
  );
}
