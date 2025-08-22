import axios from 'axios';
const API_URL = '/api/progress/';

const getMyProgress = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'my-progress', config);
    return response.data;
};

// Servicio para inscribirse en una carrera
const enrollInCareer = async (careerId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post('/api/academic-records/enroll', { careerId }, config);
    return response.data;
}

const progressService = { getMyProgress, enrollInCareer };
export default progressService;