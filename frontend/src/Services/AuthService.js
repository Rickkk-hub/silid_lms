import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const registerStudent = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Server Error");
    }
};

export const loginStudent = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Invalid credentials");
    }
};