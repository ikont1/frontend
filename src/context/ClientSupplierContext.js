import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

// Criação do contexto
const ClientSupplierContext = createContext();

// Hook para usar o contexto
export const useClientSupplier = () => useContext(ClientSupplierContext);

// Provedor do contexto
export const ClientSupplierProvider = ({ children }) => {
  const { token } = useAuth();  // Obtém o token do contexto de autenticação
  const [clientes, setClientes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  // Função para buscar clientes
  const fetchClientes = useCallback(async (params = {}) => {
    if (!token) return;

    try {
      const response = await api.get('/cliente', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          itensPorPagina: params.itensPorPagina || 10,
          pagina: params.pagina || 1,
          ordem: params.ordem || 'ASC',
          ordenarPor: params.ordenarPor || 'id',
          filtro: params.filtro || ''
        }
      });
      setClientes(response.data.data.clientes);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setClientes([]); // Se não encontrar clientes, seta um array vazio
      } else {
        // console.error('Erro ao buscar clientes', error);
      }
    }
  }, [token]);

  // Função para buscar fornecedores
  const fetchFornecedores = useCallback(async (params = {}) => {
    if (!token) return;

    try {
      const response = await api.get('/fornecedor', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          itensPorPagina: params.itensPorPagina || 10,
          pagina: params.pagina || 1,
          ordem: params.ordem || 'ASC',
          ordenarPor: params.ordenarPor || 'id',
          filtro: params.filtro || ''
        }
      });
      setFornecedores(response.data.data.fornecedores);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setFornecedores([]); // Se não encontrar fornecedores, seta um array vazio
      } else {
        // console.error('Erro ao buscar fornecedores', error);
      }
    }
  }, [token]);

  // Função para adicionar um cliente
  const addCliente = async (cliente) => {
    if (!token) return;

    try {
      const response = await api.post('/cliente', cliente, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setClientes([...clientes, response.data.data]);
    } catch (error) {
      // console.error('Erro ao adicionar cliente', error);
      throw error;
    }
  };

  // Função para adicionar um fornecedor
  const addFornecedor = async (fornecedor) => {
    if (!token) return;

    try {
      const response = await api.post('/fornecedor', fornecedor, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFornecedores([...fornecedores, response.data.data]);
    } catch (error) {
      // console.error('Erro ao adicionar fornecedor', error);
      throw error;
    }
  };

  // Função para deletar um cliente
  const deleteCliente = async (id) => {
    if (!token) return;

    try {
      await api.delete(`/cliente/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setClientes(clientes.filter(cliente => cliente.id !== id));
    } catch (error) {
      // console.error('Erro ao deletar cliente', error);
      throw error;
    }
  };

  // Função para deletar um fornecedor
  const deleteFornecedor = async (id) => {
    if (!token) return;

    try {
      await api.delete(`/fornecedor/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFornecedores(fornecedores.filter(fornecedor => fornecedor.id !== id));
    } catch (error) {
      // console.error('Erro ao deletar fornecedor', error);
      throw error;
    }
  };

  // Função para atualizar um cliente
  const updateCliente = async (id, updatedData) => {
    if (!token) return;
    const dataToSend = { ...updatedData };
    delete dataToSend.id;
    delete dataToSend.criadoEm;
    delete dataToSend.atualizadoEm;
    delete dataToSend.deletadoEm;
    delete dataToSend.cpfCnpj;

    try {
      const response = await api.patch(`/cliente/${id}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const updatedCliente = response.data;
      setClientes(clientes.map(cliente => cliente.id === id ? updatedCliente : cliente));
    } catch (error) {
      console.error(error)
      throw error;
    }
  };

  // Função para atualizar um fornecedor
  const updateFornecedor = async (id, updatedData) => {
    if (!token) return;
    const dataToSend = { ...updatedData };
    delete dataToSend.id;
    delete dataToSend.criadoEm;
    delete dataToSend.atualizadoEm;
    delete dataToSend.deletadoEm;
    delete dataToSend.cpfCnpj;

    try {
      const response = await api.patch(`/fornecedor/${id}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const updatedFornecedor = response.data;
      setFornecedores(fornecedores.map(fornecedor => fornecedor.id === id ? updatedFornecedor : fornecedor));
    } catch (error) {
      // console.error('Erro ao atualizar fornecedor', error);
      throw error;
    }
  };

  return (
    <ClientSupplierContext.Provider
      value={{
        clientes,
        fornecedores,
        fetchClientes,
        fetchFornecedores,
        addCliente,
        addFornecedor,
        deleteCliente,
        deleteFornecedor,
        updateCliente,
        updateFornecedor,
      }}
    >
      {children}
    </ClientSupplierContext.Provider>
  );
};