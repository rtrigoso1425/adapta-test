import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import gradingService from "./gradingService";

const initialState = { previewData: [], isLoading: false, message: "" };

export const getGradingPreview = createAsyncThunk(
  "grading/getPreview",
  async (sectionId, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    return await gradingService.getGradingPreview(sectionId, token);
  }
);

export const processSectionGrades = createAsyncThunk(
  "grading/process",
  async (sectionId, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    const response = await gradingService.processSectionGrades(
      sectionId,
      token
    );
    // Después de procesar, volvemos a pedir la vista previa para actualizar la tabla
    thunkAPI.dispatch(getGradingPreview(sectionId));
    return response.message;
  }
);

export const gradingSlice = createSlice({
  name: "grading",
  initialState,
  // eslint-disable-next-line no-unused-vars
  reducers: { reset: (state) => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(getGradingPreview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getGradingPreview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.previewData = action.payload;
      })
      .addCase(processSectionGrades.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(processSectionGrades.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
        alert(action.payload); // Muestra el mensaje de éxito del backend
      });
  },
});

export const { reset } = gradingSlice.actions;
export default gradingSlice.reducer;
