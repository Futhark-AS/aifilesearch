import {
  LoginAction,
  LoginState,
  initialState,
  authReducer,
} from "../reducers/authReducer/reducer";
import { useCallback, useReducer } from "react";
import { useLocalStorage } from "./useLocalStorage";

const LOCAL_STORAGE_KEY = "state";

export const usePersistantAuthReducer = () => {
  const [savedState, saveState] = useLocalStorage(
    LOCAL_STORAGE_KEY,
    initialState
  );
  const reducerLocalStorage = useCallback(
    // give `reducerLocalStorage` the same TS API as the underlying `reducer` function
    (state: LoginState, action: LoginAction): LoginState => {
      const newState = authReducer(state, action);

      saveState(newState);

      return newState;
    },

    [saveState]
  );

  return useReducer(reducerLocalStorage, savedState);
};
