import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import institutionService from './institutionService';

const initialState = {
  institutions: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Thunks
export const getInstitutions = createAsyncThunk(
  'institutions/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await institutionService.getInstitutions(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createInstitution = createAsyncThunk(
  'institutions/create',
  async (institutionData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await institutionService.createInstitution(institutionData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const institutionSlice = createSlice({
  name: 'institutions',
  initialState,
  reducers: {
    // eslint-disable-next-line no-unused-vars
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInstitutions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getInstitutions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.institutions = action.payload;
      })
      .addCase(getInstitutions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createInstitution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // --- CORRECCIÓN AQUÍ ---
        // Extraemos solo el objeto 'institution' de la respuesta compleja del backend
        if (action.payload.institution) {
            state.institutions.push(action.payload.institution);
        } else {
            // Fallback por si acaso la estructura cambia
            state.institutions.push(action.payload);
        }
      })
      .addCase(createInstitution.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = institutionSlice.actions;
export default institutionSlice.reducer;