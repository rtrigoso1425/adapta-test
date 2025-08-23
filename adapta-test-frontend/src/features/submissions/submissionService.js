import axios from 'axios';

const API_URL_ASSIGNMENTS = '/api/assignments/';
const API_URL_SECTIONS = '/api/sections/'; // Necesitamos esta para la ruta de entrega
const API_URL_SUBMISSIONS = '/api/submissions/';

// Función del estudiante (ya corregida)
const createSubmission = async (sectionId, assignmentId, submissionData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(`${API_URL_SECTIONS}${sectionId}/assignments/${assignmentId}/submit`, submissionData, config);
    return response.data;
};

// OBTENER ENTREGAS: Ahora necesita el ID de la sección y de la tarea
const getSubmissionsForAssignment = async (sectionId, assignmentId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    // Construimos la URL anidada correcta
    const response = await axios.get(`${API_URL_SECTIONS}${sectionId}/assignments/${assignmentId}/submissions`, config);
    return response.data;
};

// 👇 NUEVA FUNCIÓN: Calificar una entrega específica
const gradeSubmission = async (submissionId, gradeData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL_SUBMISSIONS}${submissionId}/grade`, gradeData, config);
    return response.data;
};

const submissionService = {
    createSubmission,
    getSubmissionsForAssignment,
    gradeSubmission,
};

export default submissionService;