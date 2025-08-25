import axios from 'axios';
const API_URL = '/api/analytics/';

// Obtener las analíticas para una sección específica
const getSectionAnalytics = async (sectionId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}section/${sectionId}`, config);
    return response.data;
};

const analyticsService = {
    getSectionAnalytics,
};

export default analyticsService;