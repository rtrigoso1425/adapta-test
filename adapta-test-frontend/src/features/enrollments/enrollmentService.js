import axios from 'axios';
const API_URL = '/api/enrollments/';

const getMyEnrollments = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'my-enrollments', config);
    return response.data;
};

// Matricularse en una sección
const enrollStudent = async (sectionId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + 'enroll', { sectionId }, config);
    return response.data;
};

const enrollmentService = { getMyEnrollments, enrollStudent };
export default enrollmentService;