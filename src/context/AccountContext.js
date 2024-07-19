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

  const cadastrarConta = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/conta', data);
      setLoading(false);
      setNotification({
        title: 'Conta cadastrada com sucesso!',
        message: 'Verifique seu email que enviamos mais informações.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      console.error(error);
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

  const atualizarConta = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/conta/${id}`, data);
      setLoading(false);
      setNotification({
        title: 'Sucesso!',
        message: 'Conta atualizada com sucesso!',
        type: 'success',
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Erro ao atualizar. Por favor, tente novamente.');
      setNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Erro ao atualizar. Por favor, tente novamente.',
        type: 'error',
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      setLoading(false);
    }
  };

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

  const listarContaPorId = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/conta/${id}`);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error(error);
      setError('Erro ao obter conta. Por favor, tente novamente.');
      setLoading(false);
      return null;
    }
  };

  const deletarConta = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/conta/${id}`);
      setLoading(false);
      setNotification({
        title: 'Sucesso!',
        message: 'Conta deletada com sucesso!',
        type: 'success',
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      console.error(error);
      setError('Erro ao deletar conta. Por favor, tente novamente.');
      setNotification({
        title: 'Erro',
        message: 'Erro ao deletar conta. Por favor, tente novamente.',
        type: 'error',
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      setLoading(false);
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
        listarContaPorId,
        deletarConta
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
