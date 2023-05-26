import { RootState } from "@/redux/store";
import { createSlice } from "@reduxjs/toolkit";

// Define a type for the slice state
export type BuyCreditsState = {
  opened: boolean;
};

// Define the initial state using that type
const initialState = {
  opened: false
} as BuyCreditsState;

export const buyCreditsSlice = createSlice({
  name: "buyCredits",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    openBuyCredits: (state) => {
      state.opened = true;
    },
    closeBuyCredits: (state) => {
      state.opened = false;
    },
  },
});

export const { openBuyCredits, closeBuyCredits } = buyCreditsSlice.actions;

export default buyCreditsSlice.reducer;

export const selectBuyCreditsOpen = (state: RootState) => state.buyCredits.opened;
