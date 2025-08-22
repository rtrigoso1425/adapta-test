import axios from 'axios';

const API_URL = '/api/careers/';

// Obtener todas las carreras
const getCareers = async (token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Crear una nueva carrera
const createCareer = async (careerData, token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.post(API_URL, careerData, config);
    return response.data;
};

// Asignar un coordinador a una carrera
const assignCoordinator = async (careerId, userId, token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.put(API_URL + careerId + '/coordinator', { userId }, config);
    return response.data;
};

const getMyCareer = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'my-career', config);
    return response.data;
};

// Añadir un curso a la malla curricular
const addCourseToCurriculum = async (careerId, courseData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + careerId + '/curriculum', courseData, config);
    return response.data;
};

const getCareerById = async (careerId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + careerId, config);
    return response.data;
};

const careerService = {
    getCareers,
    createCareer,
    assignCoordinator,
    addCourseToCurriculum,
    getMyCareer,
    getCareerById
};

export default careerService;