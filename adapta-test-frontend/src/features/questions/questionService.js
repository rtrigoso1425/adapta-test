import axios from 'axios';
const API_URL = '/api/modules/';

// Obtener las preguntas de un módulo
const getQuestionsForModule = async (moduleId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}${moduleId}/questions`, config);
    return response.data;
};

// Crear una nueva pregunta en un módulo
const createQuestion = async (moduleId, questionData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(`${API_URL}${moduleId}/questions`, questionData, config);
    return response.data;
};

const questionService = {
    getQuestionsForModule,
    createQuestion,
};

export default questionService;