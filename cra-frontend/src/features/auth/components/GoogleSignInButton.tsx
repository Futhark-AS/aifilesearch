import { GoogleLogin } from "@react-oauth/google";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../app/hooks";
import { login } from "../authSlice";
import { parseJwt } from "../parseJwt";
import { z } from "zod";
import { axios } from "@/lib/axios";

const AzureAuthResult = z.object({
  authenticationToken: z.string(),
  user: z.object({
    userId: z.string(),
  }),
});

async function handleCredentialResponse(googleAuthToken: string) {
  const res = await axios.post(
    "https://nlp-search-api.azurewebsites.net/.auth/login/google",
    { id_token: googleAuthToken },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

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

          // TODO: get token
          navigate("/app");

          dispatch(
            login({
              email: parsedGoogleJwt.email,
              firstName: parsedGoogleJwt.given_name,
              googleAuthToken: credentials,
              uid: azureAuth.data.user.userId,
              name: parsedGoogleJwt.name,
              azureAuthToken: azureAuth.data.authenticationToken,
            })
          );
        } catch (e) {
          alert(`Could not authenticate with Google (${e})`);
        }
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}
