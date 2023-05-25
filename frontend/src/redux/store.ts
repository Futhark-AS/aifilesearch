import authReducer, { logout } from "@/features/auth/authSlice";
import projectReducer from "@/features/projects/projectSlice";
import storage from "@/utils/storage";
import {
  Action,
  ThunkAction,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import { listenerMiddleware, startAppListening } from "./listenerMiddleware";

startAppListening({
  actionCreator: logout,
  effect: async (action, listenerApi) => {
    storage.setAzureToken("");
  },
});

const rootReducer = combineReducers({
  auth: authReducer,
  project: projectReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.VITE_PROD == "0",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend([listenerMiddleware.middleware]),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
