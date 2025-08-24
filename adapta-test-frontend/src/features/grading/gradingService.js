import axios from 'axios';
const API_URL = '/api/grading/';

const getGradingPreview = async (sectionId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}preview/${sectionId}`, config);
    return response.data;
};

const processSectionGrades = async (sectionId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(`${API_URL}process-section/${sectionId}`, {}, config);
    return response.data;
};

const gradingService = { getGradingPreview, processSectionGrades };
export default gradingService;