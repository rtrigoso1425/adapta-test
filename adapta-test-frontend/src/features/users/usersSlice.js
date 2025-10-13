// src/features/users/usersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  users: [], // <-- NUEVO: Para la lista general de usuarios
  coordinators: [],
  professors: [],
  isLoading: false,
};

// NUEVO THUNK: Para obtener TODOS los usuarios de la institución del admin
export const getUsers = createAsyncThunk(
  "users/getAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // La ruta /api/users ya está preparada en el backend para filtrar por institución
      const response = await axios.get("/api/users", config);
      return response.data;
    } catch (error) {
      // Manejar el error
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

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
  reducers: {
    // eslint-disable-next-line no-unused-vars
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Casos para el nuevo thunk getUsers
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload; // <-- Guardar la lista de usuarios
      })
      .addCase(getUsers.rejected, (state) => {
        state.isLoading = false;
        // Podríamos añadir un estado de error si quisiéramos
      })
      // Casos existentes
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
