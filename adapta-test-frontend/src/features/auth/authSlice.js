import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

// Obtener usuario del localStorage si ya existe una sesión
const user = JSON.parse(localStorage.getItem("user"));

const initialState = {
  user: user ? user : null,
  institutions: [],
  isLoadingInstitutions: false,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const getInstitutions = createAsyncThunk(
  "auth/getInstitutions",
  async (_, thunkAPI) => {
    try {
      return await authService.getInstitutions();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Acción Asíncrona para Registrar Usuario (Thunk)
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await authService.register(userData, token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Acción Asíncrona para Iniciar Sesión
export const login = createAsyncThunk("auth/login", async (user, thunkAPI) => {
  try {
    return await authService.login(user);
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Acción Asíncrona para Cerrar Sesión
export const logout = createAsyncThunk("auth/logout", async () => {
  authService.logout();
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInstitutions.pending, (state) => {
        state.isLoadingInstitutions = true;
      })
      .addCase(getInstitutions.fulfilled, (state, action) => {
        state.isLoadingInstitutions = false;
        state.institutions = action.payload;
      })
      .addCase(getInstitutions.rejected, (state, action) => {
        state.isLoadingInstitutions = false;
        state.message = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // ✅ NO actualizar state.user - mantener el usuario admin logueado
        // El nuevo usuario creado se retorna en action.payload pero NO se guarda en el state
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        // ✅ NO poner state.user = null aquí tampoco
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload; // ✅ Solo aquí se actualiza el usuario (al hacer login)
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;