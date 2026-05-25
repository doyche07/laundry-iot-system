import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // CHANGE HERE: backend URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('laundry_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;