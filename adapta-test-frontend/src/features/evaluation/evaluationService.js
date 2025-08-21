import axios from 'axios';

// Iniciar una nueva sesión de evaluación para un módulo
const startEvaluation = async (moduleId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    // Hacemos una petición POST vacía para iniciar la sesión
    const response = await axios.post(`/api/modules/${moduleId}/evaluations/start`, {}, config);
    return response.data;
};

// Enviar una respuesta para una sesión activa
const submitAnswer = async (sessionId, answerData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(`/api/evaluations/${sessionId}/submit`, answerData, config);
    return response.data;
};

const evaluationService = {
    startEvaluation,
    submitAnswer,
};

export default evaluationService;