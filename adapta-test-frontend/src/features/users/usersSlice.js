import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // Usaremos axios directamente para simplificar

const initialState = {
  coordinators: [],
  professors: [],
  isLoading: false,
};

// Thunk para obtener solo los coordinadores
export const getCoordinators = createAsyncThunk(
  "users/getCoordinators",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get("/api/users?role=coordinator", config);
    return response.data;
  }
);

// Thunk para obtener solo los profesores
export const getProfessors = createAsyncThunk(
  "users/getProfessors",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get("/api/users?role=professor", config);
    return response.data;
  }
);

export const usersSlice = createSlice({
  name: "users",
  initialState,
  // eslint-disable-next-line no-unused-vars
  reducers: { reset: (state) => initialState },
  extraReducers: (builder) => {
    builder
      .addCase(getCoordinators.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCoordinators.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coordinators = action.payload;
      })
      .addCase(getProfessors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfessors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.professors = action.payload;
      });
  },
});

export const { reset } = usersSlice.actions;
export default usersSlice.reducer;
