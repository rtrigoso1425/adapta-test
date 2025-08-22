import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import academicCycleService from './academicCycleService';

const initialState = { cycles: [], isLoading: false };

export const getCycles = createAsyncThunk('cycles/getAll', async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    return await academicCycleService.getCycles(token);
});

export const createCycle = createAsyncThunk('cycles/create', async (cycleData, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    return await academicCycleService.createCycle(cycleData, token);
});

export const academicCycleSlice = createSlice({
    name: 'academicCycles',
    initialState,
    // eslint-disable-next-line no-unused-vars
    reducers: { reset: (state) => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(getCycles.pending, (state) => { state.isLoading = true; })
            .addCase(getCycles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cycles = action.payload;
            })
            .addCase(createCycle.fulfilled, (state, action) => {
                state.cycles.push(action.payload);
            });
    },
});

export const { reset } = academicCycleSlice.actions;
export default academicCycleSlice.reducer;