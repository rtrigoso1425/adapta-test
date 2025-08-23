import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import sectionService from "./sectionService";

const initialState = {
  sections: [],
  mySections: [],
  isLoading: false,
  isError: false,
  message: "",
};

export const getSectionsForCourse = createAsyncThunk(
  "sections/getForCourse",
  async (courseId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await sectionService.getSectionsForCourse(courseId, token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMySections = createAsyncThunk(
  "sections/getMy",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await sectionService.getMySections(token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateApprovalCriteria = createAsyncThunk(
  "sections/updateCriteria",
  async ({ sectionId, criteriaData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await sectionService.updateApprovalCriteria(
        sectionId,
        criteriaData,
        token
      );
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const sectionSlice = createSlice({
  name: "sections",
  initialState,
  // eslint-disable-next-line no-unused-vars
  reducers: { reset: (state) => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(getSectionsForCourse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSectionsForCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sections = action.payload;
      })
      .addCase(getSectionsForCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMySections.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMySections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySections = action.payload;
      })
      .addCase(getMySections.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // eslint-disable-next-line no-unused-vars
      .addCase(updateApprovalCriteria.fulfilled, (state, action) => {
        // Opcional: podrías actualizar el estado de la sección si la tienes aquí
        // Por ahora, no es necesario hacer nada, el componente principal se encargará
      });
  },
});

export const { reset } = sectionSlice.actions;
export default sectionSlice.reducer;
