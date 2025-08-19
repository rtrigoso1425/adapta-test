import axios from 'axios';
const API_URL = '/api/enrollments/';

const getMyEnrollments = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL + 'my-enrollments', config);
    return response.data;
};
const enrollmentService = { getMyEnrollments };
export default enrollmentService;