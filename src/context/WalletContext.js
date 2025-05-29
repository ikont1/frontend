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
        message: 'Conta Bancária adicionada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
      return response.data;
    } catch (error) {
      // Verificar se o erro é relacionado à conta principal
      const contaPrincipalErro = error.response?.data?.error?.contaPrincipal;
      const mensagemErro = contaPrincipalErro
        ? `Erro: ${contaPrincipalErro}` // Exibe o erro específico de conta principal
        : error.response?.data?.message || 'Falha ao adicionar conta bancária.';

      showNotification({
        title: 'Erro',
        message: mensagemErro,
        secondaryMessage: contaPrincipalErro
          ? 'Já existe uma conta principal cadastrada. Atualize a conta principal existente ou desative-a antes de continuar.'
          : 'Verifique os dados e tente novamente.',
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

  const atualizarContaBancaria = async (id, dadosAtuais, contaPrincipal) => {
    try {
      const camposPermitidos = [
        "nomeConta",
        "codigoBanco",
        "tipo",
        "agencia",
        "numeroConta",
        "contaDV",
        "saldoInicial",
        "dataSaldoInicial",
        "chavePix",
        "codigoIban",
        "codigoSwift",
        "contaPrincipal",
      ];
  
      // Filtra apenas os campos permitidos e converte opcionais para strings
      const dadosAtualizados = Object.keys(dadosAtuais)
        .filter((key) => camposPermitidos.includes(key))
        .reduce((obj, key) => {
          obj[key] =
            key === "contaPrincipal"
              ? contaPrincipal
              : key === "chavePix" || key === "codigoIban" || key === "codigoSwift"
              ? dadosAtuais[key] || "" // Garante que seja string
              : dadosAtuais[key];
          return obj;
        }, {});
  
      const response = await api.patch(`/conta-bancaria/${id}`, dadosAtualizados);
  
      showNotification({
        title: "Sucesso",
        message: contaPrincipal
          ? "Conta marcada como principal com sucesso."
          : "Conta desmarcada como principal.",
        type: "success",
        icon: ThumbsUp,
        buttons: [{ label: "Ok", onClick: () => setNotificationData(false) }],
      });
  
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar conta bancária:", error);
  
      const contaPrincipalErro = error.response?.data?.error?.contaPrincipal;
      const mensagemErro = contaPrincipalErro
        ? `Erro: ${contaPrincipalErro}`
        : error.response?.data?.message || "Falha ao atualizar a conta bancária.";
  
      showNotification({
        title: "Erro",
        message: mensagemErro,
        secondaryMessage: contaPrincipalErro
          ? "Já existe uma conta principal cadastrada. Atualize a conta principal existente ou desative-a antes de continuar."
          : "Verifique os dados e tente novamente.",
        type: "error",
        icon: XCircle,
        buttons: [{ label: "Ok", onClick: () => setNotificationData(false) }],
      });
  
      throw error; // Propaga o erro para tratamento adicional, se necessário
    }
  };

  const listarExtrato = async (id) => {
    try {
      const response = await api.get(`/conta-bancaria/${id}/extrato`);
      console.log('extrato',response.data.data.dados);

      return response.data.data.dados;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return [];
      } else {
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
      showNotification({
        title: 'Erro na Integração',
        message: 'Verifique as credenciais e tente novamente.',
        secondaryMessage: error.response?.data?.message || 'Erro desconhecido.',
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
      desconectarConta,
      atualizarContaBancaria
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
