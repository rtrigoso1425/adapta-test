import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import planService from './planService';

const initialState = {
  plans: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const getPlans = createAsyncThunk('plans/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await planService.getPlans(token);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createPlan = createAsyncThunk('plans/create', async (data, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await planService.createPlan(data, token);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const planSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    // eslint-disable-next-line no-unused-vars
    resetPlans: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPlans.pending, (state) => { state.isLoading = true; })
      .addCase(getPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.plans.push(action.payload);
      });
  },
});

export const { resetPlans } = planSlice.actions;
export default planSlice.reducer;