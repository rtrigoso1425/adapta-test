// src/features/auth/authService.js
import axios from 'axios';

const API_URL = '/api/users/';

// NUEVA FUNCIÓN: Obtener la lista de instituciones para el selector
const getInstitutions = async () => {
    const response = await axios.get(API_URL + 'institutions');
    return response.data;
};

// MODIFICAR LOGIN: Ahora debe enviar el institutionId
const login = async (userData) => {
    // userData ahora será { email, password, institutionId }
    const response = await axios.post(API_URL + 'login', userData);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

// Registrar un usuario (se mantiene similar, pero lo usaremos más adelante)
const register = async (userData, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, userData, config);
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const authService = {
    getInstitutions, // <-- Exportar nueva función
    register,
    login,
    logout,
};

export default authService;