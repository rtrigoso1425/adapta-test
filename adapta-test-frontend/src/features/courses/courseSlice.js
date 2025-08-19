import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import courseService from './courseService';

const initialState = {
    courses: [],
    myCourses: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Thunk para obtener todos los cursos
export const getCourses = createAsyncThunk('courses/getAll', async (_, thunkAPI) => {
    try {
        // Redux Thunk nos da acceso al estado completo, ¡incluyendo el del usuario!
        const token = thunkAPI.getState().auth.user.token;
        return await courseService.getCourses(token);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getMyCourses = createAsyncThunk('courses/getMy', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await courseService.getMyCourses(token);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const courseSlice = createSlice({
    name: 'course',
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
            });
    },
});

export const { reset } = courseSlice.actions;
export default courseSlice.reducer;