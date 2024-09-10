import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import Notification from '../components/Notification/Notification';
import { ThumbsUp, AlertTriangle } from 'react-feather';

const ConciliacaoContext = createContext();

export const useConciliacao = () => useContext(ConciliacaoContext);

export const ConciliacaoProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleNotificationClose = () => {
    setNotification(null);
  };

  // Função para criar conciliação manual
  const criarConciliacao = async (data) => {
    setLoading(true);

    try {
      await api.post('/conciliacao-bancaria', data);
      setNotification({
        title: 'Sucesso!',
        message: 'Conciliação realizada.',
        secondaryMessage: 'Você pode conferir na aba "Conciliadas"',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      setNotification({
        title: 'Erro',
        message: error.response.data.message,
        secondaryMessage: error.response.data.error,
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para desfazer conciliação
  const desfazerConciliacao = async (extratoId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch('/conciliacao-bancaria/desfazer', { extratoId });
      setLoading(false);
      setNotification({
        title: 'Sucesso!',
        message: 'Conciliação desfeita com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao desfazer conciliação:', error);
      setError('Erro ao desfazer conciliação. Por favor, tente novamente.');
      setNotification({
        title: 'Erro',
        message: 'Erro ao desfazer conciliação. Por favor, tente novamente.',
        secondaryMessage: 'Verifique os dados e tente novamente!',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      setLoading(false);
    }
  };

  // Função para aceitar conciliação
  const aceitarConciliacao = async (extratoId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch('/conciliacao-bancaria/aceitar', extratoId);
      setLoading(false);
      setNotification({
        title: 'Sucesso!',
        message: 'Conciliação aceita com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao aceitar conciliação:', error);
      setError('Erro ao aceitar conciliação. Por favor, tente novamente.');
      setNotification({
        title: 'Erro',
        message: error.response.data.message,
        secondaryMessage: error.response.data.error,
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      setLoading(false);
    }
  };

  // Função para recusar conciliação
  const recusarConciliacao = async (extratoId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch('/conciliacao-bancaria/recusar', { extratoId: extratoId });
      setLoading(false);
      setNotification({
        title: 'Sucesso!',
        message: 'Conciliação recusada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao recusar conciliação:', error);
      setError('Erro ao recusar conciliação. Por favor, tente novamente.');
      setNotification({
        title: 'Erro',
        message: 'Erro ao recusar conciliação. Por favor, tente novamente.',
        secondaryMessage: 'Verifique os dados e tente novamente!',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      setLoading(false);
    }
  };

  return (
    <ConciliacaoContext.Provider
      value={{
        loading,
        error,
        criarConciliacao,
        desfazerConciliacao,
        aceitarConciliacao,
        recusarConciliacao,
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
    </ConciliacaoContext.Provider>
  );
};

export default ConciliacaoContext;
