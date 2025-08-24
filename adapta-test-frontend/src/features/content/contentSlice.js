/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import contentService from "./contentService";

const initialState = {
  course: null,
  modules: [],
  lessonsByModule: {},
  completedLessons: [],
  isLoading: false,
  isLoadingLessons: false,
  isError: false,
  message: "",
};

// Thunks
export const getModulesForSection = createAsyncThunk(
  "content/getModules",
  async (sectionId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await contentService.getModulesForSection(sectionId, token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
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
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createAndPublishModuleToSection = createAsyncThunk(
  "content/createAndPublish",
  async ({ sectionId, moduleData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      // Paso 1: Crear el módulo en la biblioteca
      const newModule = await contentService.createModuleInLibrary(
        moduleData,
        token
      );
      // Paso 2: Publicar el nuevo módulo en la sección
      await contentService.publishModuleToSection(
        sectionId,
        newModule._id,
        token
      );
      // Devolvemos el módulo creado para añadirlo al estado
      return newModule;
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getLessonsForModule = createAsyncThunk(
  "content/getLessons",
  async (moduleId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const lessons = await contentService.getLessonsForModule(moduleId, token);
      return { moduleId, lessons };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createLessonInModule = createAsyncThunk(
  "content/createLesson",
  async ({ moduleId, lessonData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await contentService.createLessonInModule(
        moduleId,
        lessonData,
        token
      );
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getCompletedLessons = createAsyncThunk(
  "content/getCompleted",
  async (sectionId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await contentService.getCompletedLessons(sectionId, token);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const markLessonAsComplete = createAsyncThunk(
  "content/markComplete",
  async ({ moduleId, lessonId, sectionId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await contentService.markLessonAsComplete(
        moduleId,
        lessonId,
        sectionId,
        token
      );
      return lessonId;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

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
      .addCase(getModulesForSection.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getModulesForSection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modules = action.payload;
      })
      .addCase(getModulesForSection.rejected, (state, action) => {
        /* ... */
      })
      .addCase(createAndPublishModuleToSection.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAndPublishModuleToSection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modules.push(action.payload); // Añadimos el nuevo módulo a la lista
      })
      .addCase(createAndPublishModuleToSection.rejected, (state, action) => {
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
      .addCase(getLessonsForModule.pending, (state) => {
        state.isLoadingLessons = true;
      })
      .addCase(getLessonsForModule.fulfilled, (state, action) => {
        state.isLoadingLessons = false;
        state.lessonsByModule[action.payload.moduleId] = action.payload.lessons;
      })
      .addCase(getLessonsForModule.rejected, (state, action) => {
        /* ... */
      })
      .addCase(createLessonInModule.fulfilled, (state, action) => {
        const moduleId = action.payload.module;
        if (state.lessonsByModule[moduleId]) {
          state.lessonsByModule[moduleId].push(action.payload);
        } else {
          state.lessonsByModule[moduleId] = [action.payload];
        }
      })
      .addCase(getCompletedLessons.fulfilled, (state, action) => {
        state.completedLessons = action.payload;
      })
      .addCase(markLessonAsComplete.fulfilled, (state, action) => {
        if (!state.completedLessons.includes(action.payload)) {
          state.completedLessons.push(action.payload);
        }
      });
  },
});

export const { reset, resetLessons } = contentSlice.actions;
export default contentSlice.reducer;
