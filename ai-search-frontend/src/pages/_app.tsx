import { GoogleOAuthProvider } from "@react-oauth/google";
import type { AppType } from "next/dist/shared/lib/utils";
import { env } from "../env/client.mjs";
import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_CLIENT_ID}>
      <Component {...pageProps} />
    </GoogleOAuthProvider>
  );
};

export default MyApp;
