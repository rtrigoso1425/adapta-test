import axios from 'axios';

// La URL base apunta a las secciones, ya que las tareas están anidadas
const API_URL = '/api/sections/';

// Crear una nueva tarea para una sección
const createAssignment = async (sectionId, assignmentData, token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.post(API_URL + sectionId + '/assignments', assignmentData, config);
    return response.data;
};

// Obtener todas las tareas de una sección
const getAssignmentsForSection = async (sectionId, token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.get(API_URL + sectionId + '/assignments', config);
    return response.data;
};

const assignmentService = {
    createAssignment,
    getAssignmentsForSection,
};

export default assignmentService;