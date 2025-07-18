import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import Notification from '../components/Notification/Notification';
import { AlertTriangle } from 'react-feather';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const clearNotification = () => {
  setNotification(null);
};
  // Decode Token
  const decodeAndStoreToken = (jwtToken) => {
    try {
      const decoded = jwtDecode(jwtToken);
      setDecodedToken(decoded);
      setPermissions(decoded?.perfil?.modulos || []);
    } catch (err) {
      console.error('Erro ao decodificar o token JWT:', err);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      decodeAndStoreToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Função centralizada para exibir notificações
  const showNotification = (title, message, secondaryMessage, thirdMessage, type, icon, buttons) => {
    setNotification({ title, message, secondaryMessage, thirdMessage, type, icon, buttons });
  };

  const login = async (login, senha) => {
    setError(null);
    try {
      const response = await api.post('/usuario/login', { login, senha });
      const token = response.data.data.jwtToken;

      setToken(token);
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      decodeAndStoreToken(token);
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao logar. Por favor, tente novamente.';

      if (error.code === 'ERR_NETWORK') {
        showNotification(
          'Problemas de conexão com internet!',
          'Houve um problema de conexão. Verifique sua internet e tente novamente.',
          'error',
          AlertTriangle,
          [{ label: 'Sair', onClick: () => setNotification(null) }]
        );
      } else if (error.response?.status === 403 && errorMessage.includes('inativa')) {
        showNotification(
          'Sua conta está temporariamente inativa!',
          'Entre em contato com o suporte para assistência.',
          'error',
          AlertTriangle,
          [
            { label: 'Falar com suporte', onClick: () => window.open('https://wa.me/5511999999999', '_blank') },
            { label: 'Sair', onClick: () => setNotification(null) },
          ]
        );
      } else if (error.response?.status === 500) {
        showNotification(
          'Erro no servidor!',
          'Desculpe, ocorreu um erro no servidor. Por favor, tente novamente mais tarde.',
          'error',
          AlertTriangle,
          [{ label: 'Sair', onClick: () => setNotification(null) }]
        );
      } else {
        setError(errorMessage);
      }
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
    } catch (error) {
      setError('Link expirado');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (fromTimeout = false) => {
    setError(null);
    setToken(null);
    setDecodedToken(null);
    setPermissions([]);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    if (fromTimeout) {
      showNotification(
        'Sessão expirada',
        'Sua sessão foi encerrada automaticamente por inatividade.',
        'Você ficou mais de 10 minutos sem realizar nenhuma ação, por isso, foi deslogado por segurança.',
        'Por favor, faça login novamente para continuar usando a plataforma.',
        'error',
        AlertTriangle,
        [{ label: 'OK', onClick: () => setNotification(null) }]
      );
    }
    setTimeout(() => navigate('/login'), 300);
  };

  // Logout automático após 10 minutos de inatividade
  useEffect(() => {
    if (!token) return;

    let timeout;
    const logoutAfterInactivity = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        logout(true);
      }, 10 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, logoutAfterInactivity));

    logoutAfterInactivity();

    return () => {
      clearTimeout(timeout);
      events.forEach((event) => window.removeEventListener(event, logoutAfterInactivity));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);


  return (
    <AuthContext.Provider value={{ clearNotification, token, decodedToken, permissions, loading, error, login, logout, resetPassword, setPassword, showNotification }}>
      {children}
      {notification && (
        <Notification
          title={notification.title}
          message={notification.message}
          secondaryMessage={notification.secondaryMessage}
          thirdMessage={notification.thirdMessage}
          type={notification.type}
          icon={notification.icon}
          buttons={notification.buttons}
        />
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;