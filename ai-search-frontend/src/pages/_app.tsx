import "../styles/globals.css";
import type { AppType } from "next/dist/shared/lib/utils";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { env } from "../env/client.mjs";
import { NotificationsProvider } from "@mantine/notifications";
import { MantineProvider } from "@mantine/core";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <MantineProvider>
      <NotificationsProvider>
        <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_CLIENT_ID}>
          <Component {...pageProps} />
        </GoogleOAuthProvider>
      </NotificationsProvider>
    </MantineProvider>
  );
};

export default MyApp;
