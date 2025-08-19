import axios from 'axios';

const API_URL = '/api/courses/';

// Obtener todos los cursos (requiere token)
const getCourses = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Obtener los cursos del instructor logueado
const getMyCourses = async (token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.get(API_URL + 'mycourses', config);
    return response.data;
};

const courseService = {
    getCourses,
    getMyCourses,
};

export default courseService;