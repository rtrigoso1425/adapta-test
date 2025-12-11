import axios from 'axios';
const API_URL = '/api/plans/';

const getPlans = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(API_URL, config);
  return response.data;
};

const createPlan = async (planData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.post(API_URL, planData, config);
  return response.data;
};

const planService = { getPlans, createPlan };
export default planService;