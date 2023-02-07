import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../features/auth/authSlice";
import { AppDispatch, RootState } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useIsAuthenticated = () =>
  useAppSelector((state) => selectIsAuthenticated(state));

export const useUser = () => useAppSelector((state) => selectUser(state));
