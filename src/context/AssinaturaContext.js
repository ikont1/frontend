import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import { ThumbsUp, XCircle } from 'react-feather'; // Importar ícones
import Notification from '../components/Notification/Notification'; // Importar o componente de notificação


const AssinaturaContext = createContext();

export const useAssinatura = () => useContext(AssinaturaContext);

export const AssinaturaProvider = ({ children }) => {
  const [assinatura, setAssinatura] = useState(null);
  const [faturas, setFaturas] = useState([]);
  const [cartoes, setCartoes] = useState([]);
  const [notificationData, setNotificationData] = useState(null);

  // Função para exibir notificação
  const showNotification = (data) => {
    setNotificationData(data);
  };

  // Função para criar assinatura
  const criarAssinatura = async (dados) => {
    try {
      const response = await api.post('/assinatura', dados);
      setAssinatura(response.data);
      showNotification({
        title: 'Sucesso',
        message: 'Assinatura realizada com sucesso.',
        secondaryMessage: 'Verifique o email cadastrado ',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao processar a solicitação.',
        secondaryMessage: 'Verifique os dados e tente novamente',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    }
  };

  // Função para cancelar assinatura
  const cancelarAssinatura = async () => {
    try {
      await api.delete('/assinatura');
      setAssinatura(null);
      showNotification({
        title: 'Sucesso',
        message: 'Assinatura cancelada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao cancelar assinatura.',
        secondaryMessage: 'Verifique os dados e tente novamente',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    }
  };

  // Função para listar assinaturas
  const listarAssinaturas = async () => {
    try {
      const response = await api.get('/assinatura');
      setAssinatura(response.data);
    } catch (error) {
      throw error;
    }
  };

  // Função para listar faturas
  const listarFaturas = async () => {
    try {
      const response = await api.get('/assinatura/faturas');
      setFaturas(response.data);
    } catch (error) {
      throw error;
    }
  };

  // Função para listar cartões
  const listarCartoes = async () => {
    try {
      const response = await api.get('/assinatura/cartao');
      setCartoes(response.data);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AssinaturaContext.Provider value={{
      assinatura,
      faturas,
      cartoes,
      criarAssinatura,
      cancelarAssinatura,
      listarAssinaturas,
      listarFaturas,
      listarCartoes,
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
    </AssinaturaContext.Provider>
  );
};
