import "../styles/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { AppType } from "next/dist/shared/lib/utils";
import { env } from "../env/client.mjs";
import AuthProvider from "../utils/context/AuthContext";
import { StrictMode } from "react";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <StrictMode>
      <AuthProvider>
        <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_CLIENT_ID}>
          <Component {...pageProps} />
        </GoogleOAuthProvider>
      </AuthProvider>
    </StrictMode>
  );
};

export default MyApp;
