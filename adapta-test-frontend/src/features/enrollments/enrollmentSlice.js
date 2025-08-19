import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import enrollmentService from './enrollmentService';

const initialState = {
    enrollments: [],
    isLoading: false,
    isError: false,
    message: '',
};

export const getMyEnrollments = createAsyncThunk('enrollments/getMy', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await enrollmentService.getMyEnrollments(token);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const enrollmentSlice = createSlice({
    name: 'enrollments',
    initialState,
    // eslint-disable-next-line no-unused-vars
    reducers: { reset: (state) => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(getMyEnrollments.pending, (state) => { state.isLoading = true; })
            .addCase(getMyEnrollments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.enrollments = action.payload;
            })
            .addCase(getMyEnrollments.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;