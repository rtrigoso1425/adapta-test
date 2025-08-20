/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import contentService from "./contentService";

const initialState = {
  course: null,
  modules: [],
  lessonsByModule: {},
  isLoading: false,
  isLoadingLessons: false,
  isError: false,
  message: "",
};

// Thunks
export const getModulesForCourse = createAsyncThunk(
  "content/getModules",
  async (courseId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await contentService.getModulesForCourse(courseId, token);
    } catch (error) {
      /* ... manejo de error ... */
    }
  }
);

// Thunk para obtener los detalles del curso
export const getCourseDetails = createAsyncThunk(
  "content/getDetails",
  async (courseId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await contentService.getCourseDetails(courseId, token);
    } catch (error) {
      /* ... manejo de error ... */
    }
  }
);

export const createAndPublishModule = createAsyncThunk(
  "content/createAndPublish",
  async ({ courseId, moduleData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      // Paso 1: Crear el módulo en la biblioteca
      const newModule = await contentService.createModuleInLibrary(
        moduleData,
        token
      );
      // Paso 2: Publicar el nuevo módulo en el curso
      await contentService.publishModuleToCourse(
        courseId,
        newModule._id,
        token
      );
      // Devolvemos el módulo creado para añadirlo al estado
      return newModule;
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      /* ... manejo de error ... */
    }
  }
);

export const getLessonsForModule = createAsyncThunk('content/getLessons', async (moduleId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        const lessons = await contentService.getLessonsForModule(moduleId, token);
        return { moduleId, lessons };
    } catch (error) { /* ... */ }
});

export const createLessonInModule = createAsyncThunk('content/createLesson', async ({ moduleId, lessonData }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.user.token;
        return await contentService.createLessonInModule(moduleId, lessonData, token);
    } catch (error) { /* ... */ }
});


export const contentSlice = createSlice({
  name: "content",
  initialState,
  // eslint-disable-next-line no-unused-vars
  reducers: {
    reset: (state) => initialState,
    resetLessons: (state, action) => {
        delete state.lessonsByModule[action.payload]; // Elimina las lecciones de un módulo específico
    },
},
  
  extraReducers: (builder) => {
    builder
      .addCase(getModulesForCourse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getModulesForCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modules = action.payload;
      })
      .addCase(getModulesForCourse.rejected, (state, action) => {
        /* ... */
      })
      .addCase(createAndPublishModule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAndPublishModule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modules.push(action.payload); // Añadimos el nuevo módulo a la lista
      })
      .addCase(createAndPublishModule.rejected, (state, action) => {
        /* ... */
      })
      .addCase(getCourseDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCourseDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.course = action.payload;
      })
      .addCase(getCourseDetails.rejected, (state, action) => {
        /* ... */
      })
      .addCase(getLessonsForModule.pending, (state) => { state.isLoadingLessons = true; })
        .addCase(getLessonsForModule.fulfilled, (state, action) => {
            state.isLoadingLessons = false;
            state.lessonsByModule[action.payload.moduleId] = action.payload.lessons;
        })
        .addCase(getLessonsForModule.rejected, (state, action) => { /* ... */ })
        .addCase(createLessonInModule.fulfilled, (state, action) => {
            const moduleId = action.payload.module;
            if (state.lessonsByModule[moduleId]) {
                state.lessonsByModule[moduleId].push(action.payload);
            } else {
                state.lessonsByModule[moduleId] = [action.payload];
            }
        });
  },
});



export const { reset, resetLessons} = contentSlice.actions;
export default contentSlice.reducer;
