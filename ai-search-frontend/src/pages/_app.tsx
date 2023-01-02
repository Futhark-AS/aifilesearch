import "../styles/globals.css";
import type { AppType } from "next/dist/shared/lib/utils";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { env } from "../env/client.mjs";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_CLIENT_ID}>
      <Component {...pageProps} />
    </GoogleOAuthProvider>
  );
};

export default MyApp;
