import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token a cada requisição
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor para capturar erros de autenticação
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status } = error.response;

      // Se o token for inválido, remover do localStorage e redirecionar para login
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');

        //Se já estiver na página de login não realiza a ação
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;