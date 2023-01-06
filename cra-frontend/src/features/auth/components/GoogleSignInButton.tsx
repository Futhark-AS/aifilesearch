import { GoogleLogin } from "@react-oauth/google";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../app/hooks";
import { login } from "../authSlice";
import { parseJwt } from "../parseJwt";

export default function GoogleSignInButton() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        console.log(credentialResponse)
        const credentials = credentialResponse.credential;
        const userId = credentialResponse.clientId

        if (!credentials || !userId) return alert("Could not authenticate with Google");

        try {
          const parsed = parseJwt(credentials);

          // TODO: get token
          navigate("/app");

          dispatch(
            login({
              email: parsed.email,
              firstName: parsed.given_name,
              googleAuthToken: credentials,
              uid: userId,
              name: parsed.name,
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
