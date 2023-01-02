import { useLocalStorage } from "@mantine/hooks";
import { useEffect } from "react";
import { z } from "zod";


export default function useUser() {
  const [user, setUser] = useLocalStorage<null | User>({
    key: "user",
    defaultValue: null,
  });
  const [token, setToken] = useLocalStorage<null | string>({
    key: "token",
    defaultValue: null,
  });
  const [uid, setUid] = useLocalStorage<null | string>({
    key: "uid",
    defaultValue: null,
  });

  const [signedIn, setSignedIn] = useLocalStorage<boolean>({
    key: "signedIn",
    defaultValue: false,
  });

  const logout = () => {
    intermediateSetUser(null);
    setToken(null);
    setUid(null);
  };

  const intermediateSetUser = (user: User | null) => {
    console.log(user);
    setUser(user);
  };

  return {
    user,
    setUser: intermediateSetUser,
    token,
    setToken,
    uid,
    setUid,
    logout,
  };
}
