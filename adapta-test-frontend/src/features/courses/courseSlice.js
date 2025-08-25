/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import courseService from "./courseService";

const initialState = {
  courses: [],
  myCourses: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// Thunk para obtener todos los cursos
export const getCourses = createAsyncThunk(
  "courses/getAll",
  async (_, thunkAPI) => {
    try {
      // Redux Thunk nos da acceso al estado completo, ¡incluyendo el del usuario!
      const token = thunkAPI.getState().auth.user.token;
      return await courseService.getCourses(token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMyCourses = createAsyncThunk(
  "courses/getMy",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await courseService.getMyCourses(token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createCourse = createAsyncThunk(
  "courses/create",
  async (courseData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await courseService.createCourse(courseData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const uploadSyllabus = createAsyncThunk(
  "courses/uploadSyllabus",
  async ({ courseId, formData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await courseService.uploadSyllabus(courseId, formData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.courses = action.payload;
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMyCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myCourses = action.payload;
      })
      .addCase(getMyCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.courses.push(action.payload);
      })
      .addCase(uploadSyllabus.fulfilled, (state, action) => {
        // Actualizamos el curso en nuestro estado local con la nueva ruta del sílabus
        const index = state.courses.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        alert("Sílabus subido exitosamente.");
      })
      .addCase(uploadSyllabus.rejected, (state, action) => {
        alert("Error al subir el sílabus: " + action.payload);
      });
  },
});

export const { reset } = courseSlice.actions;
export default courseSlice.reducer;
