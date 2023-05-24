import { getUser } from "@/features/projects/requests";
import { baseAxios } from "@/lib/axios";
import storage from "@/utils/storage";
import { GoogleLogin } from "@react-oauth/google";
import React from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAppDispatch } from "../../../redux/hooks";
import { login } from "../authSlice";
import { parseJwt } from "../parseJwt";
import { postUser } from "../requests";

const AzureAuthResult = z.object({
  authenticationToken: z.string(),
  user: z.object({
    userId: z.string(),
  }),
});

async function handleCredentialResponse(googleAuthToken: string) {
  const res = await baseAxios.post(
    "https://nlp-search-api.azurewebsites.net/.auth/login/google",
    { id_token: googleAuthToken },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  console.log("accesst oken", res);

  return AzureAuthResult.safeParse(res.data);
}

export default function GoogleSignInButton() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        console.log(credentialResponse);
        const credentials = credentialResponse.credential;
        if (!credentials) return alert("Could not authenticate with Google");

        try {
          const parsedGoogleJwt = parseJwt(credentials);

          const azureAuth = await handleCredentialResponse(credentials);

          if (!azureAuth.success) {
            alert("Could not authenticate with Azure");
            return;
          }

          storage.setAzureToken(azureAuth.data.authenticationToken);

          const user = await getUser();

          const isSigningUp = user == null;

          if (isSigningUp) {
            await postUser({
              id: azureAuth.data.user.userId,
              email: parsedGoogleJwt.email,
              name: parsedGoogleJwt.name,
            });
            dispatch(
              login({
                email: parsedGoogleJwt.email,
                firstName: parsedGoogleJwt.given_name,
                uid: azureAuth.data.user.userId,
                name: parsedGoogleJwt.name,
                credits: 0
              })
            );
          } else {
            dispatch(
              login({
                email: parsedGoogleJwt.email,
                firstName: parsedGoogleJwt.given_name,
                uid: azureAuth.data.user.userId,
                name: parsedGoogleJwt.name,
                credits: user.credits
              })
            );

          }

          // TODO: get token
          navigate("/app");
        } catch (e) {
          console.log(e)
          alert(`Could not authenticate with Google (${e})`);
        }
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}
