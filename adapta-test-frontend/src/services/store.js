import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import courseReducer from '../features/courses/courseSlice'; // <-- 1. IMPORTAR
import enrollmentReducer from '../features/enrollments/enrollmentSlice';
import sectionReducer from '../features/sections/sectionSlice';
import contentReducer from '../features/content/contentSlice'; // <-- 2. IMPORTAR
import assignmentReducer from '../features/assignments/assignmentSlice';
import learningReducer from '../features/learning/learningSlice'; // <-- 3. IMPORTAR
import questionReducer from '../features/questions/questionSlice'; // <-- 4. IMPORTAR
import evaluationReducer from '../features/evaluation/evaluationSlice';
import careerReducer from '../features/careers/careerSlice';
import usersReducer from '../features/users/usersSlice';
import academicCycleReducer from '../features/academic-cycles/academicCycleSlice';
import progressReducer from '../features/progress/progressSlice';
import matriculaReducer from '../features/matricula/matriculaSlice';
import submissionReducer from '../features/submissions/submissionSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        courses: courseReducer, // <-- 2. AÑADIR
        enrollments: enrollmentReducer,
        sections: sectionReducer,
        content: contentReducer,
        assignments: assignmentReducer, // <-- 3. AÑADIR
        learning: learningReducer,
        questions: questionReducer, // <-- 4. AÑADIR
        evaluation: evaluationReducer, // <-- AÑADIR
        careers: careerReducer, // <-- AÑADIR
        users: usersReducer, // <-- AÑADIR
        academicCycles: academicCycleReducer, // <-- AÑADIR
        progress: progressReducer,
        matricula: matriculaReducer,
        submissions: submissionReducer,
    },
});