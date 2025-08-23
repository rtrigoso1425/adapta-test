import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    selectedSections: {}, // Usamos un objeto para evitar duplicados: { courseId: sectionObject }
    isLoading: false,
    error: null,
};

export const confirmMatricula = createAsyncThunk('matricula/confirm', async (sectionIds, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.post('/api/enrollments/enroll-batch', { sectionIds }, config);
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

export const matriculaSlice = createSlice({
    name: 'matricula',
    initialState,
    reducers: {
        addSection: (state, action) => {
            const section = action.payload;
            state.selectedSections[section.course] = section;
        },
        removeSection: (state, action) => {
            const courseIdToRemove = action.payload;
            delete state.selectedSections[courseIdToRemove];
        },
        clearMatricula: (state) => {
            state.selectedSections = {};
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(confirmMatricula.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(confirmMatricula.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(confirmMatricula.fulfilled, (state, action) => {
                state.isLoading = false;
                alert(action.payload.message);
                window.location.reload(); // Recargar para ver el dashboard de cursos
            });
    }
});

export const { addSection, removeSection, clearMatricula } = matriculaSlice.actions;
export default matriculaSlice.reducer;