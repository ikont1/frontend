// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://52.4.128.222/api', // Verifique se a baseURL está correta
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar interceptor para garantir que o token seja adicionado a cada requisição
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;
