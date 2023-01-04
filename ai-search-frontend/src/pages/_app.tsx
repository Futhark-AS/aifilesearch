import "../styles/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { AppType } from "next/dist/shared/lib/utils";
import { env } from "../env/client.mjs";
import { StrictMode } from "react";
import { store } from "../redux/store/store";
import { Provider } from "react-redux";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <StrictMode>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_CLIENT_ID}>
          <Component {...pageProps} />
        </GoogleOAuthProvider>
      </Provider>
    </StrictMode>
  );
};

export default MyApp;
