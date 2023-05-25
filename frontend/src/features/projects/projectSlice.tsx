import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import { HighlightedBox } from "@/components/PdfViewer";

export enum leftBarShowing {
  chat = "chat",
  search = "search",
  files = "files",
  none = "none",
}

// Define a type for the slice state
export type ProjectPageState = {
  leftBarShowing: leftBarShowing;
  highlightedResult: HighlightedBox | null;
};

// Define the initial state using that type
const initialState = {
  leftBarShowing: leftBarShowing.chat,
  highlightedResult: null
} as ProjectPageState;

export const projectSlice = createSlice({
  name: "project",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setHighlightedResult: (state, action) => {
      state.highlightedResult = action.payload;
    },
    togglePane: (state, action: PayloadAction<leftBarShowing>) => {
      state.leftBarShowing = action.payload
    },
  },
});

export const { togglePane, setHighlightedResult } = projectSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectLeftPanelChosen = (state: RootState) =>
  state.project.leftBarShowing

export const selectHighlightedResult = (state: RootState) =>
  state.project.highlightedResult

export default projectSlice.reducer;
