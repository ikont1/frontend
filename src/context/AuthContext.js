// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Notification from '../components/Notification/Notification';
import { AlertTriangle } from 'react-feather';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (login, senha) => {
    setError(null);
    try {
      const response = await api.post('/usuario/login', { login, senha });
      const token = response.data.data.jwtToken;

      setToken(token);
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao logar. Por favor, tente novamente.';

      if (error.code === 'ERR_NETWORK') {
        setNotification({
          title: 'Problemas de conexão com internet!',
          message: 'Houve um problema de conexão. Por favor, verifique sua internet e tente novamente.',
          type: 'error',
          icon: AlertTriangle,
          buttons: [{ label: 'Sair', onClick: () => setNotification(null) }],
        });
      } else if (error.response?.status === 403 && errorMessage.includes('inativa')) {
        setNotification({
          title: 'Sua conta está temporariamente inativa!',
          message: 'Entre em contato com o nosso suporte para obter assistência.',
          type: 'error',
          icon: AlertTriangle,
          buttons: [
            { label: 'Falar com suporte', onClick: () => window.open('https://wa.me/5511999999999', '_blank') },
            { label: 'Sair', onClick: () => setNotification(null) },
          ],
        });
      } else if (error.response?.status === 500) {
        setNotification({
          title: 'Erro no servidor!',
          message: 'Desculpe, ocorreu um erro no servidor. Por favor, tente novamente mais tarde.',
          type: 'error',
          icon: AlertTriangle,
          buttons: [{ label: 'Sair', onClick: () => setNotification(null) }],
        });
      } else {
        setError(errorMessage);
      }
    }
  };

  const logout = async () => {
    setError(null);
    try {
      setToken(null);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.log('Logout error response:', error);
      setError('Erro ao fazer logout');
    }
  };

  const resetPassword = async (login) => {
    setError(null);
    try {
      await api.post('/usuario/recuperar-senha', { login });
      localStorage.setItem('tempLogin', login);
    } catch (error) {
      console.log('resetPassword error response:', error.response?.data);
      setError(error.response?.data?.message || 'Erro ao recuperar senha');
      throw error;
    }
  };

  const setPassword = async (token, senha, senha2) => {
    setError(null);
    setLoading(true);
    try {
      await api.post('/usuario/redefinir-senha', { token, senha, senha2 });
      const tempLogin = localStorage.getItem('tempLogin');
      if (tempLogin) {
        await login(tempLogin, senha);
        localStorage.removeItem('tempLogin');
      }
      setLoading(false);
    } catch (error) {
      console.log('setPassword error response:', error.response?.data);
      setError(error.response?.data?.message || 'Erro ao redefinir senha');
      setLoading(false);
    }
  };

  const cadastrarUsuario = async (login, email, nome) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/usuario', { login, email, nome });
      setLoading(false);
      alert('Usuário cadastrado com sucesso! Verifique seu email');
      navigate('/login');
    } catch (error) {
      console.error(error)
      console.log('Cadastro error response:', error.response?.data);
      setError(error.response?.data?.message || 'Erro ao cadastrar. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ token, loading, error, login, logout, resetPassword, setPassword, cadastrarUsuario }}>
      {children}
      {notification && (
        <Notification
          title={notification.title}
          message={notification.message}
          type={notification.type}
          icon={notification.icon}
          buttons={notification.buttons}
        />
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
