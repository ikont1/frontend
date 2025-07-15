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



const publicRoutes = [
  '/assinatura',
  '/recuperar-senha',
  '/nova-senha'
];

// Interceptor para capturar erros de autenticação
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status } = error.response;
      const currentPath = window.location.pathname;

      const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));

      // Somente desloga em 401
      if (status === 401 && !isPublicRoute) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;