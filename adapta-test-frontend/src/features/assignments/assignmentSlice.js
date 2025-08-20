import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import assignmentService from './assignmentService';

const initialState = {
    assignments: [],
    isLoading: false,
    isError: false,
    message: '',
};

// Thunk para OBTENER las tareas de una sección
export const getAssignmentsForSection = createAsyncThunk('assignments/getForSection', async (sectionId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await assignmentService.getAssignmentsForSection(sectionId, token);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Thunk para CREAR una nueva tarea
export const createAssignment = createAsyncThunk('assignments/create', async ({ sectionId, assignmentData }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await assignmentService.createAssignment(sectionId, assignmentData, token);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const assignmentSlice = createSlice({
    name: 'assignments',
    initialState,
    reducers: {
        // eslint-disable-next-line no-unused-vars
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAssignmentsForSection.pending, (state) => { state.isLoading = true; })
            .addCase(getAssignmentsForSection.fulfilled, (state, action) => {
                state.isLoading = false;
                state.assignments = action.payload;
            })
            .addCase(getAssignmentsForSection.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createAssignment.pending, (state) => { state.isLoading = true; })
            .addCase(createAssignment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.assignments.push(action.payload);
            })
            .addCase(createAssignment.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = assignmentSlice.actions;
export default assignmentSlice.reducer;