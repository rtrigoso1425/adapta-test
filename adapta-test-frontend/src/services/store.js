import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import courseReducer from '../features/courses/courseSlice'; // <-- 1. IMPORTAR
import enrollmentReducer from '../features/enrollments/enrollmentSlice';
import sectionReducer from '../features/sections/sectionSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        courses: courseReducer, // <-- 2. AÑADIR
        enrollments: enrollmentReducer,
        sections: sectionReducer,
    },
});