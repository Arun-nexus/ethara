import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

const api = axios.create({ 
  baseURL: API_BASE, 
  headers: { 'Content-Type': 'application/json' } 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((r) => r, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;