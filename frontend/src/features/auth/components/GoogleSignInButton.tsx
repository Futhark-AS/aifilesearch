import { baseAxios } from "@/lib/axios";
import { GoogleLogin } from "@react-oauth/google";
import React from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAppDispatch } from "../../../redux/hooks";
import { setLoading, setUser } from "../authSlice";
import { parseJwt } from "../parseJwt";
import { getUser, postUser } from "../api";
import storage from "@/utils/storage";
import { showError } from "@/utils/showError";
import { User } from "../types";

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

          let data: { isSigningUp: true } | { isSigningUp: false; user: User };

          dispatch(setLoading(true));

          try {
            const res = await getUser();
            data = {
              isSigningUp: false,
              user: res,
            };
          } catch (e) {
            data = {
              isSigningUp: true,
            };
          }

          if (data.isSigningUp == true) {
            await postUser({
              email: parsedGoogleJwt.email,
              name: parsedGoogleJwt.name,
            });
            dispatch(
              setUser({
                email: parsedGoogleJwt.email,
                id: azureAuth.data.user.userId,
                name: parsedGoogleJwt.name,
                credits: 0,
                isLoggedIn: true,
                projects: [],
              })
            );
          } else {
            dispatch(
              setUser({
                email: parsedGoogleJwt.email,
                id: azureAuth.data.user.userId,
                name: parsedGoogleJwt.name,
                credits: data.user.credits,
                isLoggedIn: true,
                projects: data.user.projects,
              })
            );
          }
          // TODO: get token
          navigate("/app");
        } catch (e) {
          console.log(e);
          dispatch(setLoading(false));
          showError(
            "There was an error in the system. Please try again later."
          );
        }
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}
