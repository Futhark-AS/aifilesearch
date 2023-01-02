import { useLocalStorage } from "@mantine/hooks";
import { LoginAction, LoginState, initialState, authReducer } from '../context/user-context/reducer';
import { useCallback, useReducer } from "react";

const LOCAL_STORAGE_KEY = "state";

export const usePersistantAuthReducer = () => {
  const [savedState, saveState] = useLocalStorage({
    key: LOCAL_STORAGE_KEY,
    defaultValue: initialState,
  });

  const reducerLocalStorage = useCallback(
    // give `reducerLocalStorage` the same TS API as the underlying `reducer` function
    (state: LoginState, action: LoginAction): LoginState => {

      const newState = authReducer(state, action)

      saveState(newState)

      return newState
    },

    [saveState],
  )


  return useReducer(reducerLocalStorage, savedState)

};
