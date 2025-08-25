import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import analyticsService from './analyticsService';

const initialState = {
    analyticsData: null,
    isLoading: false,
    isError: false,
    message: '',
};

export const getSectionAnalytics = createAsyncThunk('analytics/getForSection', async (sectionId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await analyticsService.getSectionAnalytics(sectionId, token);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

export const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        // eslint-disable-next-line no-unused-vars
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSectionAnalytics.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getSectionAnalytics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.analyticsData = action.payload;
            })
            .addCase(getSectionAnalytics.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = analyticsSlice.actions;
export default analyticsSlice.reducer;