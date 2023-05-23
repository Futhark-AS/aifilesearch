import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { z } from "zod";
import { RootState } from "../../redux/store";

export const AuthSchema = z.object({
  email: z.string(),
  name: z.string(),
  firstName: z.string(),
  uid: z.string(),
  googleAuthToken: z.string(),
  isLoading: z.boolean(),
  error: z.string(),
  isLoggedIn: z.boolean(),
  azureAuthToken: z.string(),
  credits: z.number(),
});

// Define a type for the slice state
export type UserState = z.infer<typeof AuthSchema>;

// Define the initial state using that type
const initialState = {
  email: "",
  name: "",
  firstName: "",
  uid: "",
  googleAuthToken: "",
  isLoading: false,
  error: "",
  isLoggedIn: false,
  credits: 0,
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
        googleAuthToken: string;
        uid: string;
        azureAuthToken: string;
        credtis: number;
      }>
    ) => {
      // return initialState
      return {
        error: "",
        email: action.payload.email,
        name: action.payload.name,
        firstName: action.payload.firstName,
        googleAuthToken: action.payload.googleAuthToken,
        uid: action.payload.uid,
        isLoggedIn: true,
        isLoading: false,
        azureAuthToken: action.payload.azureAuthToken,
        credits: action.payload.credtis,
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
