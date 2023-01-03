import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store/store";
import { z } from "zod";

export const UserSchema = z.object({
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
type UserState = z.infer<typeof UserSchema>;

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

export const userSlice = createSlice({
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
      console.log("running login reducer", action.payload);
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

export const { login, logout, hydrate } = userSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectUserIsLoggedIn = (state: RootState) => state.user.isLoggedIn;
export const selectUser = (state: RootState) => state.user;

export default userSlice.reducer;
