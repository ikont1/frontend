import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import Notification from '../components/Notification/Notification';
import { ThumbsUp, AlertTriangle } from 'react-feather';

const AccountContext = createContext();

export const useAccount = () => useContext(AccountContext);

export const AccountProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleNotificationClose = () => {
    setNotification(null);
  };

  // Cadastrar conta
  const cadastrarConta = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/conta', data);
      setLoading(false);
      setNotification({
        title: 'Tudo certo!',
        message: 'Enviaremos um e-mail de Confirmação de Pagamento',
        type: 'success2',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao cadastrar. Por favor, tente novamente.');
      setNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Erro ao cadastrar. Por favor, tente novamente.',
        secondaryMessage: 'Verifique todos os dados e tente novamente!',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      setLoading(false);
    }
  };

  // Atualizar dados minha empresa
  const atualizarConta = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch('/conta', data);
      setLoading(false);
      setNotification({
        title: 'Sucesso!',
        message: 'Dados da Empresa foram atualizados com sucesso',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Erro ao atualizar. Por favor, tente novamente.');
      setNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Erro ao atualizar. Por favor, tente novamente.',
        secondaryMessage: 'Verifique todos os capos e tente novamente',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      setLoading(false);
    }
  };

  // Listar dados minha empresa
  const listarContas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/conta');
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error(error);
      setError('Erro ao listar contas. Por favor, tente novamente.');
      setLoading(false);
      return [];
    }
  };



  return (
    <AccountContext.Provider
      value={{
        loading,
        error,
        cadastrarConta,
        atualizarConta,
        listarContas,
      }}
    >
      {children}
      {notification && (
        <Notification
          title={notification.title}
          message={notification.message}
          secondaryMessage={notification.secondaryMessage}
          type={notification.type}
          buttons={notification.buttons}
          icon={notification.icon}
          onClose={handleNotificationClose}
        />
      )}
    </AccountContext.Provider>
  );
};

export default AccountContext;
