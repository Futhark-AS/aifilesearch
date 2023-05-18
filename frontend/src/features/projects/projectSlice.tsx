import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import { HighlightedBox } from "@/components/PdfViewer";

export enum leftBarShowing {
  search = "search",
  files = "files",
  none = "none",
}

// Define a type for the slice state
export type ProjectPageState = {
  leftBarShowing: leftBarShowing;
  projectFiles: string[];
  highlightedResult: HighlightedBox | null;
  uploadingFiles: {
    name: string;
    submitted: boolean;
    error: string;
    success: boolean;
  }[];
};

// Define the initial state using that type
const initialState = {
  leftBarShowing: leftBarShowing.search,
  projectFiles: [],
  uploadingFiles: [],
  highlightedResult: null
} as ProjectPageState;

export const projectSlice = createSlice({
  name: "project",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    toggleSearchPane: (state) => {
      state.leftBarShowing = state.leftBarShowing == leftBarShowing.search ? leftBarShowing.none : leftBarShowing.search;
    },
    toggleFilesPane: (state) => {
      state.leftBarShowing = state.leftBarShowing == leftBarShowing.files ? leftBarShowing.none : leftBarShowing.files;
    },
    setHighlightedResult: (state, action) => {
      state.highlightedResult = action.payload;
    }
  },
});

export const { toggleFilesPane, toggleSearchPane, setHighlightedResult } = projectSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectLeftPanelChosen = (state: RootState) =>
  state.project.leftBarShowing

export const selectHighlightedResult = (state: RootState) =>
  state.project.highlightedResult

export default projectSlice.reducer;
