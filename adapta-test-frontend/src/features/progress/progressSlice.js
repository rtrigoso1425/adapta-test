import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import progressService from './progressService';

const initialState = {
    progressData: null,
    isLoading: true,
};

export const getMyProgress = createAsyncThunk('progress/getMy', async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    return await progressService.getMyProgress(token);
});

export const enrollInCareer = createAsyncThunk('progress/enrollCareer', async (careerId, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    await progressService.enrollInCareer(careerId, token);
    // Después de inscribirse, volvemos a pedir el progreso para actualizar la vista
    return await progressService.getMyProgress(token);
});

export const progressSlice = createSlice({
    name: 'progress',
    initialState,
    // eslint-disable-next-line no-unused-vars
    reducers: { reset: (state) => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(getMyProgress.pending, (state) => { state.isLoading = true; })
            .addCase(getMyProgress.fulfilled, (state, action) => {
                state.isLoading = false;
                state.progressData = action.payload;
            })
            .addCase(enrollInCareer.pending, (state) => { state.isLoading = true; })
            .addCase(enrollInCareer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.progressData = action.payload;
            });
    },
});

export const { reset } = progressSlice.actions;
export default progressSlice.reducer;