import React, { PropsWithChildren, createContext } from "react";
import { usePersistantAuthReducer } from "../hooks/usePersistantAuthReducer";
import { LoginState } from "../reducers/authReducer/reducer";

export type AuthContextValue = {
  state: LoginState;
  login: (params: LoginParams) => void;
  authError: () => void;
  logout: () => void;
};

type LoginParams = {
  email: string;
  name: string;
  firstName: string;
  token: string;
  uid: string;
};

const Store = createContext<AuthContextValue>({} as AuthContextValue);

export const useAuth = () => React.useContext(Store);

const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [authState, dispatch] = usePersistantAuthReducer();

  const login = (payload: LoginParams) => {
    dispatch({ type: "login", payload });
  };

  const authError = () => dispatch({ type: "error" });
  const logout = () => {
    dispatch({ type: "logout" });
    console.log("logging out");
  };

  return (
    <Store.Provider value={{ state: authState, login, authError, logout }}>
      {children}
    </Store.Provider>
  );
};

export default AuthProvider;
