import axios from "axios";
import useAuthStore from "../store/authStore";

const API_URL = " https://event-manager-a5zv.onrender.com/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})


// Interceptor to add the Authorization header

api.interceptors.request.use((config) => {

    const token = useAuthStore.getState().token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
        config.headers.delete?.('Content-Type');
        delete config.headers['Content-Type'];
    }

    return config;
})

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData);
    return response.data;
}

// Request or response interceptor to add the token

export default api