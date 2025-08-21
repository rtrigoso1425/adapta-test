import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import questionService from './questionService';

const initialState = {
    questionsByModule: {},
    isLoading: false,
};

export const getQuestionsForModule = createAsyncThunk('questions/getForModule', async (moduleId, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    return await questionService.getQuestionsForModule(moduleId, token);
});

export const createQuestion = createAsyncThunk('questions/create', async ({ moduleId, questionData }, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    return await questionService.createQuestion(moduleId, questionData, token);
});

export const questionSlice = createSlice({
    name: 'questions',
    initialState,
    // eslint-disable-next-line no-unused-vars
    reducers: { reset: (state) => initialState },
    extraReducers: (builder) => {
        builder
            .addCase(getQuestionsForModule.pending, (state) => { state.isLoading = true; })
            .addCase(getQuestionsForModule.fulfilled, (state, action) => {
                state.isLoading = false;
                state.questionsByModule[action.meta.arg] = action.payload;
            })
            .addCase(createQuestion.fulfilled, (state, action) => {
                const moduleId = action.payload.module;
                if (state.questionsByModule[moduleId]) {
                    state.questionsByModule[moduleId].push(action.payload);
                }
            });
    },
});

export const { reset } = questionSlice.actions;
export default questionSlice.reducer;