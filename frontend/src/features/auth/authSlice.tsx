import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import { User } from "./types";

type UserState = {
  user: User;
  isLoading: boolean;
  error: string;
};

// Define the initial state using that type
const initialState = {
  user: {
    email: "",
    name: "",
    id: "",
    credits: 0,
    isLoggedIn: false,
    projects: [],
  } as User,
  isLoading: false,
  error: "",
} as UserState;

export const authSlice = createSlice({
  name: "user",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    hydrate: (state, action: PayloadAction<UserState>) => {
      return action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      // return initialState
      return {
        ...state,
        user: action.payload,
        isLoading: false,
      };
    },
    setUserCredits: (state, action: PayloadAction<{ credits: number }>) => {
      return {
        ...state,
        user: {
          ...state.user,
          credits: action.payload.credits,
        },
      };
    },
    logout: () => {
      return initialState;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isLoading: action.payload,
      };
    },
  },
});

export const { setUser, logout, hydrate, setUserCredits, setLoading } =
  authSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.user.isLoggedIn;
export const selectUser = (state: RootState) => state.auth;

export default authSlice.reducer;
