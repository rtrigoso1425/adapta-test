import axios from 'axios';

const API_URL = '/api/institutions/';

// Obtener todas las instituciones
const getInstitutions = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Crear una nueva institución
const createInstitution = async (institutionData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.post(API_URL, institutionData, config);
  return response.data;
};

const institutionService = {
  getInstitutions,
  createInstitution,
};

export default institutionService;