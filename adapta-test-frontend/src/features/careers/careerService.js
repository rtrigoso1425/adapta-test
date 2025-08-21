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

const careerService = {
    getCareers,
    createCareer,
    assignCoordinator,
};

export default careerService;