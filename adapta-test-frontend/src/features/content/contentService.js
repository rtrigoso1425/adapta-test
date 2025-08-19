import axios from 'axios';

const API_URL_COURSES = '/api/courses/';
const API_URL_MODULES = '/api/modules/';

// Obtener los módulos publicados en un curso
const getModulesForCourse = async (courseId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL_COURSES + courseId + '/modules', config);
    return response.data;
};

// Crear un módulo en la biblioteca del profesor
const createModuleInLibrary = async (moduleData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL_MODULES, moduleData, config);
    return response.data;
};

// Publicar un módulo en un curso
const publishModuleToCourse = async (courseId, moduleId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL_COURSES + courseId + '/modules', { moduleId }, config);
    return response.data;
};

// Obtener los detalles de un curso específico
const getCourseDetails = async (courseId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    // Usamos la URL base de cursos, no la de módulos
    const response = await axios.get(API_URL_COURSES + courseId, config);
    return response.data;
};

const contentService = {
    getModulesForCourse,
    createModuleInLibrary,
    publishModuleToCourse,
    getCourseDetails,
};

export default contentService;