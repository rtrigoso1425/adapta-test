import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import evaluationService from './evaluationService';

const initialState = {
    session: null,
    currentQuestion: null,
    lastResult: null,
    isCompleted: false,
    isLoading: false,
    isError: false,
    message: '',
};

export const startEvaluation = createAsyncThunk('evaluation/start', async (moduleId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await evaluationService.startEvaluation(moduleId, token);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const submitAnswer = createAsyncThunk('evaluation/submit', async ({ sessionId, answerData }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await evaluationService.submitAnswer(sessionId, answerData, token);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const evaluationSlice = createSlice({
    name: 'evaluation',
    initialState,
    reducers: {
        // eslint-disable-next-line no-unused-vars
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(startEvaluation.pending, (state) => { state.isLoading = true; })
            .addCase(startEvaluation.fulfilled, (state, action) => {
                state.isLoading = false;
                state.session = { sessionId: action.payload.sessionId };
                state.currentQuestion = action.payload.question;
                state.isCompleted = false;
                state.lastResult = null;
            })
            .addCase(startEvaluation.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(submitAnswer.pending, (state) => { state.isLoading = true; })
            .addCase(submitAnswer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.lastResult = action.payload.result;
                if (action.payload.status === 'completed') {
                    state.isCompleted = true;
                    state.currentQuestion = null;
                    state.session = action.payload; // Guardar el score final
                } else {
                    state.currentQuestion = action.payload.nextQuestion;
                }
            })
            .addCase(submitAnswer.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = evaluationSlice.actions;
export default evaluationSlice.reducer;