import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import Notification from '../components/Notification/Notification';
import { ThumbsUp, AlertTriangle } from 'react-feather';

const NfContext = createContext();

export const useNf = () => useContext(NfContext);

export const NfProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleNotificationClose = () => {
    setNotification(null);
  };

  const fetchNfs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/nf');
      setLoading(false);
      console.log(response.data.data.nfs);
      return response.data.data.nfs;
    } catch (err) {
      setError('Erro ao buscar notas fiscais.');
      console.error('Erro ao listar NFs', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const criarConciliacao = async (data) => {
    setLoading(true);
    try {
      await api.post('/nf/conciliacao', data);
      setNotification({
        title: 'Sucesso!',
        message: 'Conciliação criada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      setError('Erro ao criar conciliação.');
      setNotification({
        title: 'Erro',
        message: 'Erro ao criar conciliação.',
        secondaryMessage: error.response?.data?.message || 'Por favor, tente novamente.',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } finally {
      setLoading(false);
    }
  };

  const aceitarConciliacao = async (id) => {
    setLoading(true);
    try {
      await api.patch('/nf/conciliacao/aceitar', { id });
      setNotification({
        title: 'Sucesso!',
        message: 'Conciliação aceita com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      setError('Erro ao aceitar conciliação.');
      setNotification({
        title: 'Erro',
        message: 'Erro ao aceitar conciliação.',
        secondaryMessage: 'Por favor, tente novamente.',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } finally {
      setLoading(false);
    }
  };

  const recusarConciliacao = async (id) => {
    setLoading(true);
    try {
      await api.patch('/nf/conciliacao/recusar', { id });
      setNotification({
        title: 'Sucesso!',
        message: 'Conciliação recusada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      setError('Erro ao recusar conciliação.');
      setNotification({
        title: 'Erro',
        message: 'Erro ao recusar conciliação.',
        secondaryMessage: 'Por favor, tente novamente.',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } finally {
      setLoading(false);
    }
  };

  const desfazerConciliacao = async (id) => {
    setLoading(true);
    try {
      await api.patch('/nf/conciliacao/desfazer', { nfId: id });
      setNotification({
        title: 'Sucesso!',
        message: 'Conciliação desfeita com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      setError('Erro ao desfazer conciliação.');
      setNotification({
        title: 'Erro',
        message: 'Erro ao desfazer conciliação.',
        secondaryMessage: error.response?.data?.message || 'Por favor, tente novamente.',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } finally {
      setLoading(false);
    }
  };

  const statusMonitoramento = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/nf/status');
      setLoading(false);
      console.log(response.data);
      return response.data;
    } catch (err) {
      setError('Erro ao verificar status.');
      console.error('Erro ao verificar status', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const ativarMonitoramento = async (id) => {
    setLoading(true);
    try {
      await api.patch('/nf/ativar-monitoramento', { id });
      setNotification({
        title: 'Sucesso!',
        message: 'Você já solicitou a ativação do monitoramento, aguarde enquanto o processo é concluído.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      const backendMessage = error.response?.data?.error || 'Erro ao ativar monitoramento.';
      setError(backendMessage);
      console.error(error);

      setNotification({
        title: 'Erro',
        message: backendMessage,
        secondaryMessage: 'Por favor, tente novamente.',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } finally {
      setLoading(false);
    }
  };

  const desativarMonitoramento = async (id) => {
    setLoading(true);
    try {
      await api.patch('/nf/desativar-monitoramento', { id });
      setNotification({
        title: 'Sucesso!',
        message: 'Monitoramento desativado com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      const backendMessage = error.response?.data?.error || 'Erro ao desativar monitoramento.';
      setError(backendMessage);
      console.error(error);

      setNotification({
        title: 'Erro',
        message: backendMessage,
        secondaryMessage: 'Por favor, tente novamente.',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <NfContext.Provider
      value={{
        loading,
        error,
        fetchNfs,
        criarConciliacao,
        aceitarConciliacao,
        recusarConciliacao,
        desfazerConciliacao,
        statusMonitoramento,
        ativarMonitoramento,
        desativarMonitoramento,
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
    </NfContext.Provider>
  );
};

export default NfContext;