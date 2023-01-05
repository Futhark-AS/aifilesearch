import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";
import { RootState } from "../../app/store";

export const AuthSchema = z.object({
  email: z.string(),
  name: z.string(),
  firstName: z.string(),
  uid: z.string(),
  token: z.string(),
  isLoading: z.boolean(),
  error: z.string(),
  isLoggedIn: z.boolean(),
});

// Define a type for the slice state
export type UserState = z.infer<typeof AuthSchema>;

// Define the initial state using that type
const initialState = {
  email: "",
  name: "",
  firstName: "",
  uid: "",
  token: "",
  isLoading: false,
  error: "",
  isLoggedIn: false,
} as UserState;

export const authSlice = createSlice({
  name: "user",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    hydrate: (state, action: PayloadAction<UserState>) => {
        return action.payload;
    },
    login: (
      state,
      action: PayloadAction<{
        email: string;
        name: string;
        firstName: string;
        token: string;
        uid: string;
      }>
    ) => {
      // return initialState
      return {
        error: "",
        email: action.payload.email,
        name: action.payload.name,
        firstName: action.payload.firstName,
        token: action.payload.token,
        uid: action.payload.uid,
        isLoggedIn: true,
        isLoading: false,
      };
    },
    logout: () => {
      return initialState;
    },
  },
});

export const { login, logout, hydrate } = authSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectIsAuthenticated = (state: RootState) => state.auth.isLoggedIn;
export const selectUser = (state: RootState) => state.auth;

export default authSlice.reducer;
