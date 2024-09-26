import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import { ThumbsUp, XCircle } from 'react-feather'; // Importar ícones
import Notification from '../components/Notification/Notification'; // Importar o componente de notificação

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
  const [contasAPagar, setContasAPagar] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [contasAReceber, setContasAReceber] = useState([]);
  const [categoriasAReceber, setCategoriasAReceber] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificationData, setNotificationData] = useState(null);

  // Função para exibir notificação
  const showNotification = (data) => {
    setNotificationData(data);
  };

  // Requisições contas a pagar
  const fetchContasAPagar = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/contas-a-pagar');
      setContasAPagar(response.data.data.contas);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/contas-a-pagar/categorias');
      setCategorias(response.data.data);
    } catch (error) {
      setError(error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao buscar categorias.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const addContaAPagar = async (novaConta) => {
    setLoading(true);
    try {
      await api.post('/contas-a-pagar', novaConta);
      fetchContasAPagar();
      showNotification({
        title: 'Sucesso',
        message: 'Conta a pagar adicionada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      console.log(error)
      setError(error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao adicionar conta a pagar.',
        secondaryMessage: 'Verifique os dados e tente novamente',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContaAPagar = async (id, contaAtualizada) => {
    setLoading(true);
    try {
      await api.patch(`/contas-a-pagar/${id}`, contaAtualizada);
      fetchContasAPagar();
      showNotification({
        title: 'Sucesso',
        message: 'Conta a pagar atualizada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      setError(error);
      showNotification({
        title: 'Erro',
        message: 'Esta conta nao pode ser atualizada.',
        secondaryMessage: error.response?.data?.message || 'Falha ao atualizar conta a pagar.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } finally {
      setLoading(false);
    }
  };

  const informPagamento = async (id, pagamento) => {
    setLoading(true);
    try {
      await api.patch(`/contas-a-pagar/${id}/informar-pagamento`, pagamento);
      fetchContasAPagar();
      showNotification({
        title: 'Sucesso',
        message: 'Pagamento informado com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      setError(error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao informar pagamento.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } finally {
      setLoading(false);
    }
  };

  const desfazerPagamento = async (id) => {
    setLoading(true);
    try {
      await api.patch(`/contas-a-pagar/${id}/desfazer-pagamento`);
      fetchContasAPagar();
      showNotification({
        title: 'Sucesso',
        message: 'Pagamento desfeito com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      setError(error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao desfazer pagamento.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteContaAPagar = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/contas-a-pagar/${id}`);
      fetchContasAPagar();
      showNotification({
        title: 'Sucesso',
        message: 'Conta a pagar removida com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      setError(error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao remover conta a pagar.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } finally {
      setLoading(false);
    }
  };

  // Requisições contas a receber
  const fetchContasAReceber = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/contas-a-receber');
      console.log(response.data.data.contas);
      setContasAReceber(response.data.data.contas);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoriasAReceber = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/contas-a-receber/categorias');
      setCategoriasAReceber(response.data.data);
    } catch (error) {
      setError(error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao buscar categorias.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const addContaAReceber = async (novaConta) => {
    setLoading(true);
    try {
      await api.post('/contas-a-receber', novaConta);
      fetchContasAReceber();
      showNotification({
        title: 'Sucesso',
        message: 'Conta a receber adicionada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      console.log(error)
      setError(error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao adicionar conta a receber.',
        secondaryMessage: 'Verifique os dados e tente novamente',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContaAReceber = async (id, contaAtualizada) => {
    setLoading(true);
    try {
      await api.patch(`/contas-a-receber/${id}`, contaAtualizada);
      fetchContasAReceber();
      showNotification({
        title: 'Sucesso',
        message: 'Conta a receber atualizada com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      setError(error);
      showNotification({
        title: 'Erro',
        message: 'Esta conta nao pode ser atualizada.',
        secondaryMessage: error.response?.data?.message || 'Falha ao atualizar conta a receber.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } finally {
      setLoading(false);
    }
  };

  const informRecebimento = async (id, recebimento) => {
    setLoading(true);
    try {
      await api.patch(`/contas-a-receber/${id}/informar-recebimento`, recebimento);
      fetchContasAReceber();
      showNotification({
        title: 'Sucesso',
        message: 'Recebimento informado com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      setError(error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao informar recebimento.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } finally {
      setLoading(false);
    }
  };

  const desfazerRecebimento = async (id) => {
    setLoading(true);
    try {
      await api.patch(`/contas-a-receber/${id}/desfazer-recebimento`);
      fetchContasAReceber();
      showNotification({
        title: 'Sucesso',
        message: 'Recebimento desfeito com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      console.log(error)
      setError(error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao desfazer recebimento.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteContaAReceber = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/contas-a-receber/${id}`);
      fetchContasAReceber();
      showNotification({
        title: 'Sucesso',
        message: 'Conta a receber removida com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } catch (error) {
      setError(error);
      showNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Falha ao remover conta a receber.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setNotificationData(false) }],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FinanceContext.Provider value={{
      contasAPagar,
      categorias,
      contasAReceber,
      categoriasAReceber,
      fetchContasAPagar,
      fetchCategorias,
      addContaAPagar,
      updateContaAPagar,
      informPagamento,
      desfazerPagamento,
      deleteContaAPagar,
      fetchContasAReceber,
      fetchCategoriasAReceber,
      addContaAReceber,
      updateContaAReceber,
      informRecebimento,
      desfazerRecebimento,
      deleteContaAReceber,
      loading,
      error
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
    </FinanceContext.Provider>
  );
};
