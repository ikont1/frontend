// AuthContext.js
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
  const [decodedToken, setDecodedToken] = useState(null); // Estado para armazenar os dados decodificados
  const [permissions, setPermissions] = useState([]);//Armazenda os modulos de permissoes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  // Decode Token
  const decodeAndStoreToken = (jwtToken) => {
    try {
      const decoded = jwtDecode(jwtToken); // Decodifica o token
      setDecodedToken(decoded); 
      setPermissions(decoded?.perfil?.modulos || []); // Extrai módulos do perfil
    } catch (err) {
      console.error('Erro ao decodificar o token JWT:', err);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      decodeAndStoreToken(storedToken); // Decodifica e armazena ao carregar
    }
    setLoading(false);
  }, []);

  // Função centralizada para exibir notificações
  const showNotification = (title, message, type, icon, buttons) => {
    setNotification({ title, message, type, icon, buttons });
  };

  const login = async (login, senha) => {
    setError(null);
    try {
      const response = await api.post('/usuario/login', { login, senha });
      const token = response.data.data.jwtToken;

      setToken(token);
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      decodeAndStoreToken(token); // Decodifica e armazena ao fazer login
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

  const logout = async () => {
    setError(null);
    setToken(null);
    setDecodedToken(null);
    setPermissions([]);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
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
      }
      navigate(tempLogin ? '/' : '/login');
    } catch (error) {
      // console.log('setPassword error response:', error.response?.data);
      setError(error.response?.data?.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ token,decodedToken , permissions, loading, error, login, logout, resetPassword, setPassword }}>
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







// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import Notification from '../components/Notification/Notification';
// import { AlertTriangle } from 'react-feather';


// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [notification, setNotification] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedToken = localStorage.getItem('token');
//     if (storedToken) {
//       setToken(storedToken);
//       api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
//     }
//     setLoading(false);
//   }, []);

//   const login = async (login, senha) => {
//     setError(null);
//     try {
//       const response = await api.post('/usuario/login', { login, senha });
//       const token = response.data.data.jwtToken;

//       setToken(token);
//       localStorage.setItem('token', token);
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

//       navigate('/');
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || 'Erro ao logar. Por favor, tente novamente.';

//       if (error.code === 'ERR_NETWORK') {
//         setNotification({
//           title: 'Problemas de conexão com internet!',
//           message: 'Houve um problema de conexão. Por favor, verifique sua internet e tente novamente.',
//           type: 'error',
//           icon: AlertTriangle,
//           buttons: [{ label: 'Sair', onClick: () => setNotification(null) }],
//         });
//       } else if (error.response?.status === 403 && errorMessage.includes('inativa')) {
//         setNotification({
//           title: 'Sua conta está temporariamente inativa!',
//           message: 'Entre em contato com o nosso suporte para obter assistência.',
//           type: 'error',
//           icon: AlertTriangle,
//           buttons: [
//             { label: 'Falar com suporte', onClick: () => window.open('https://wa.me/5511999999999', '_blank') },
//             { label: 'Sair', onClick: () => setNotification(null) },
//           ],
//         });
//       } else if (error.response?.status === 500) {
//         setNotification({
//           title: 'Erro no servidor!',
//           message: 'Desculpe, ocorreu um erro no servidor. Por favor, tente novamente mais tarde.',
//           type: 'error',
//           icon: AlertTriangle,
//           buttons: [{ label: 'Sair', onClick: () => setNotification(null) }],
//         });
//       } else {
//         setError(errorMessage);
//       }
//     }
//   };

//   const logout = async () => {
//     setError(null);
//     try {
//       setToken(null);
//       localStorage.removeItem('token');
//       navigate('/login');
//     } catch (error) {
//       console.log('Logout error response:', error);
//       setError('Erro ao fazer logout');
//     }
//   };

//   const resetPassword = async (login) => {
//     setError(null);
//     try {
//       await api.post('/usuario/recuperar-senha', { login });
//       localStorage.setItem('tempLogin', login);
//     } catch (error) {
//       console.log('resetPassword error response:', error.response?.data);
//       setError(error.response?.data?.message || 'Erro ao recuperar senha');
//       throw error;
//     }
//   };

//   const setPassword = async (token, senha, senha2) => {
//     setError(null); // Limpa o erro anterior
//     setLoading(true); // Inicia o estado de carregamento
//     try {
//       // Envia a requisição para redefinir ou criar a senha
//       await api.post('/usuario/redefinir-senha', { token, senha, senha2 });
  
//       const tempLogin = localStorage.getItem('tempLogin');
//       if (tempLogin) {
//         // Se o login temporário existir, tenta realizar o login automaticamente
//         await login(tempLogin, senha);
//         navigate('/'); // Redireciona para a home após login bem-sucedido
//       } else {
//         // Se o tempLogin não existir, redireciona para login
//         navigate('/login');
//       }
//     } catch (error) {
//       console.log('setPassword error response:', error.response?.data);
//       // Define a mensagem de erro recebida ou uma mensagem padrão
//       setError(error.response?.data?.message || 'Erro ao redefinir senha');
//     } finally {
//       setLoading(false); // Finaliza o estado de carregamento
//     }
//   };
  
  
  


//   return (
//     <AuthContext.Provider value={{ token, loading, error, login, logout, resetPassword, setPassword }}>
//       {children}
//       {notification && (
//         <Notification
//           title={notification.title}
//           message={notification.message}
//           type={notification.type}
//           icon={notification.icon}
//           buttons={notification.buttons}
//         />
//       )}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;
