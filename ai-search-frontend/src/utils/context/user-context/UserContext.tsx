import React, { PropsWithChildren, createContext } from "react";
import { usePersistantAuthReducer } from "../../hooks/usePersistantAuthReducer";
import { LoginState } from "./reducer";

export type AuthContextValue = {
  state: LoginState;
  login: (email: string, name: string, token: string) => void;
  authError: () => void;
  logout: () => void;
};

const Store = createContext<AuthContextValue>({} as AuthContextValue);

export const useAuth = () => React.useContext(Store);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [authState, dispatch] = usePersistantAuthReducer();

  const login = (email: string, name: string, token: string) => {
    dispatch({ type: "login", payload: { email, name, token } });
  };

  const authError = () => dispatch({ type: "error" });
  const logout = () => dispatch({ type: "logOut" });

  return (
    <Store.Provider value={{ state: authState, login, authError, logout }}>
      {children}
    </Store.Provider>
  );
};
