import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import { ThumbsUp, XCircle } from 'react-feather'; // Importar ícones
import Notification from '../components/Notification/Notification'; // Importar o componente de notificação


export const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [notificationData, setNotificationData] = useState(null);


  const showNotification = (data) => {
    setNotificationData(data);
  };


  const listarContas = async () => {
    try {
      const response = await api.get('/conta-bancaria');
      console.log(response.data.data.contas);
      return response.data.data.contas;
    } catch (error) {
      throw error;
    }
  };

  const cadastrarConta = async (dadosConta) => {
    try {
      const response = await api.post('/conta-bancaria', dadosConta);
      showNotification({
        title: 'Sucesso',
        message: 'Conta Bacaria adicionada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar conta:', error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao adicionar conta bancaria.',
        secondaryMessage: 'Verifique os dados e tente novamente',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    }
  };

  const excluirConta = async (id) => {
    try {
      await api.delete(`/conta-bancaria/${id}`);

      showNotification({
        title: 'Sucesso',
        message: 'Conta Bacaria adicionada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao remover conta bancaria.',
        secondaryMessage: 'Tente novamente mais tarde',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    }
  };

  const desativarConta = async (id) => {
    try {
      await api.patch(`/conta-bancaria/${id}/desativar`);
      showNotification({
        title: 'Sucesso',
        message: 'Conta Bancária desativada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      console.error('Erro ao desativar conta:', error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.error || 'Falha ao desativar conta bancária.',
        secondaryMessage: 'Tente novamente mais tarde',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
      throw error;
    }
  };

  const reativarConta = async (id) => {
    try {
      await api.patch(`/conta-bancaria/${id}/reativar`);
      showNotification({
        title: 'Sucesso',
        message: 'Conta Bancária reativada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      console.error('Erro ao reativar conta:', error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.error || 'Falha ao reativar conta bancária.',
        secondaryMessage: 'Tente novamente mais tarde',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
      throw error;
    }
  };

  const listarExtrato = async (id) => {
    try {
      const response = await api.get(`/conta-bancaria/${id}/extrato`);
      return response.data.data.dados;
    } catch (error) {
      // Trata especificamente o erro 404
      if (error.response && error.response.status === 404) {
        return []; // Retorna uma lista vazia caso não haja extrato
      } else {
        // Loga os outros tipos de erro
        throw error;
      }
    }
  };

  // conectar conta bb
  const integrarConta = async (id, { clientId, clientSecret }) => {
    try {
      await api.post(`/conta-bancaria/${id}/conectar`, {
        clientId,
        clientSecret,
      });

      showNotification({
        title: 'Integração Bem-Sucedida',
        message: 'Conta conectada com sucesso! Monitoramento iniciado.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(null) }],
      });

      return true;
    } catch (error) {
      console.error('Erro ao integrar conta:', error);

      showNotification({
        title: 'Erro na Integração',
        message: 'Verifique as credenciais e tente novamente.',
        secondaryMessage: error.response?.data?.message || 'Falha ao conectar a conta.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(null) }],
      });

      return false; // Retorna falha
    }
  };

  const desconectarConta = async (id) => {
    try {
      await api.patch(`/conta-bancaria/${id}/desconectar`);
      showNotification({
        title: 'Sucesso',
        message: 'Conta desconectada com sucesso!',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      console.error('Erro ao desconectar conta:', error);
      showNotification({
        title: 'Erro',
        message: 'Falha ao desconectar a conta. Tente novamente mais tarde.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    }
  };



  return (
    <WalletContext.Provider value={{
      listarContas,
      cadastrarConta,
      excluirConta,
      reativarConta,
      desativarConta,
      listarExtrato,
      integrarConta,
      desconectarConta
    }}>
      {children}

      {notificationData && (
        <Notification
          title={notificationData.title}
          message={notificationData.message}
          type={notificationData.type}
          icon={notificationData.icon}
          buttons={notificationData.buttons}
          secondaryMessage={notificationData.secondaryMessage}
        />
      )}
    </WalletContext.Provider>
  );
};
