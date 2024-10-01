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

  const listarExtrato = async (id, pagina = 1, itensPorPagina = 100) => {
    try {
      const response = await api.get(`/conta-bancaria/${id}/extrato`, {
        params: {
          pagina,
          itensPorPagina,
        },
      });
      return response.data.data;
    } catch (error) {
      // Trata especificamente o erro 404
      if (error.response && error.response.status === 404) {
        return { dados: [], total: 0, paginas: 0 }; // Retorna estrutura vazia caso não haja extrato
      } else {
        // Loga os outros tipos de erro
        throw error;
      }
    }
  };
  
  

  return (
    <WalletContext.Provider value={{
      listarContas,
      cadastrarConta,
      excluirConta,
      reativarConta,
      desativarConta,
      listarExtrato
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
