import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import enrollmentService from "./enrollmentService";

const initialState = {
  enrollments: [],
  isLoading: false,
  isError: false,
  message: "",
};

export const getMyEnrollments = createAsyncThunk(
  "enrollments/getMy",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await enrollmentService.getMyEnrollments(token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const enrollStudent = createAsyncThunk(
  "enrollments/enroll",
  async (sectionId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await enrollmentService.enrollStudent(sectionId, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const enrollmentSlice = createSlice({
  name: "enrollments",
  initialState,
  // eslint-disable-next-line no-unused-vars
  reducers: { reset: (state) => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(getMyEnrollments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyEnrollments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollments = action.payload;
      })
      .addCase(getMyEnrollments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(enrollStudent.fulfilled, (state, action) => {
        alert(action.payload.message); // Muestra "¡Matrícula exitosa!"
        // Forzamos un refresco para que el dashboard del estudiante se actualice
        window.location.reload();
      })
      .addCase(enrollStudent.rejected, (state, action) => {
        alert("Error de Matrícula: " + action.payload); // Muestra el error de validación del backend
      });
  },
});

export const { reset } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
