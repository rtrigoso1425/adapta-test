import axios from 'axios';
const API_URL = '/api/academic-cycles/';

const getCycles = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL, config);
    return response.data;
};

const createCycle = async (cycleData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, cycleData, config);
    return response.data;
};

const academicCycleService = { getCycles, createCycle };
export default academicCycleService;