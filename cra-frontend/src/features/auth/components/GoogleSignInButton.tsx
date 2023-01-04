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
        const credentials = credentialResponse.credential;
        if (!credentials) return alert("Could not authenticate with Google");

        try {
          const parsed = parseJwt(credentials);

          // TODO: get token
          navigate("/app");

          dispatch(
            login({
              email: parsed.email,
              firstName: parsed.given_name,
              token: "token",
              uid: "uid",
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
