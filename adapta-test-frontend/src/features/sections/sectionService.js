import axios from 'axios';
// La URL base apunta a los cursos, ya que las secciones están anidadas
const API_URL = '/api/courses/';

// Obtener las secciones de un curso específico
const getSectionsForCourse = async (courseId, token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.get(API_URL + courseId + '/sections', config);
    return response.data;
};

const getMySections = async (token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.get('/api/sections/my-sections', config);
    return response.data;
};

const sectionService = { getSectionsForCourse, getMySections };
export default sectionService;