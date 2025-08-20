import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import learningService from './learningService';

const initialState = {
    section: null, // Aquí guardaremos los datos de la sección activa
    isLoading: false,
    isError: false,
    message: '',
};

export const getSectionDetails = createAsyncThunk('learning/getSectionDetails', async (sectionId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await learningService.getSectionDetails(sectionId, token);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const learningSlice = createSlice({
    name: 'learning',
    initialState,
    reducers: {
        // eslint-disable-next-line no-unused-vars
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSectionDetails.pending, (state) => { state.isLoading = true; })
            .addCase(getSectionDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.section = action.payload;
            })
            .addCase(getSectionDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = learningSlice.actions;
export default learningSlice.reducer;