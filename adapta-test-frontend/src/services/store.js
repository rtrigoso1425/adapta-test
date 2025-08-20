import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import courseReducer from '../features/courses/courseSlice'; // <-- 1. IMPORTAR
import enrollmentReducer from '../features/enrollments/enrollmentSlice';
import sectionReducer from '../features/sections/sectionSlice';
import contentReducer from '../features/content/contentSlice'; // <-- 2. IMPORTAR
import assignmentReducer from '../features/assignments/assignmentSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        courses: courseReducer, // <-- 2. AÑADIR
        enrollments: enrollmentReducer,
        sections: sectionReducer,
        content: contentReducer,
        assignments: assignmentReducer, // <-- 3. AÑADIR
    },
});