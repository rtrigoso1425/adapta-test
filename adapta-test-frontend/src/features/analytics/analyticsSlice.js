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

// --- NUEVA SOLUCIÓN: SELECTOR INTELIGENTE ---
// Esta función "cruza" los datos: toma los IDs de las analíticas y busca 
// sus textos correspondientes en el banco de preguntas (si ya han sido cargadas).
export const selectEnrichedAnalytics = (state) => {
    const { analyticsData } = state.analytics;
    const { questionsByModule } = state.questions || {}; // Accedemos al slice de questions

    // Si no hay datos, retornamos null
    if (!analyticsData) return null;

    // Clonamos para no mutar el estado original
    const enrichedData = { ...analyticsData };

    // Mapeamos las preguntas difíciles para intentar "hidratarlas" con texto
    if (enrichedData.difficultQuestions && Array.isArray(enrichedData.difficultQuestions)) {
        enrichedData.difficultQuestions = enrichedData.difficultQuestions.map(([item, count]) => {
            
            // Si el backend ya mandó el objeto (arreglo ideal), lo usamos
            if (typeof item === 'object' && item !== null && item.questionText) {
                return [item, count];
            }

            // Si es solo un ID (tu problema actual), buscamos el texto en el store de preguntas
            const questionId = item;
            let foundText = null;

            // Buscamos en todos los módulos cargados
            if (questionsByModule) {
                for (const moduleId in questionsByModule) {
                    const found = questionsByModule[moduleId].find(q => q._id === questionId);
                    if (found) {
                        foundText = found.questionText;
                        break;
                    }
                }
            }

            // Retornamos un objeto simulado con el texto encontrado o un fallback
            return [
                { 
                    _id: questionId, 
                    questionText: foundText || "Cargando texto..." // Fallback si no se ha visitado el módulo
                }, 
                count
            ];
        });
    }

    return enrichedData;
};

export const { reset } = analyticsSlice.actions;
export default analyticsSlice.reducer;