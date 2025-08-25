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

const createCourse = async (courseData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, courseData, config);
    return response.data;
};

// Subir un sílabus para un curso
const uploadSyllabus = async (courseId, formData, token) => {
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(`${API_URL}${courseId}/upload-syllabus`, formData, config);
    return response.data;
};

const courseService = {
    getCourses,
    getMyCourses,
    createCourse,
    uploadSyllabus
};

export default courseService;