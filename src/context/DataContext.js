import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from './AuthContext';

// Criação do contexto
const DataContext = createContext();

// Hook para usar o contexto
export const useData = () => useContext(DataContext);

// Provedor do contexto
export const DataProvider = ({ children }) => {
  const { token } = useAuth();  // Obtém o token do contexto de autenticação
  const [clientes, setClientes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [contasAPagar, setContasAPagar] = useState([]);

  // Função para buscar clientes
  const fetchClientes = async (params = {}) => {
    if (!token) return; // Se não há token, não faz a requisição

    try {
      console.log(`Fetching clients with token: Bearer ${token}`);
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
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes', error);
    }
  };

  // Função para buscar fornecedores
  const fetchFornecedores = async () => {
    if (!token) return; // Se não há token, não faz a requisição

    try {
      const response = await axios.get('/fornecedores', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFornecedores(response.data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores', error);
    }
  };

  // Função para buscar contas a pagar
  const fetchContasAPagar = async () => {
    if (!token) return; // Se não há token, não faz a requisição

    try {
      const response = await axios.get('/contasAPagar', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setContasAPagar(response.data);
    } catch (error) {
      console.error('Erro ao buscar contas a pagar', error);
    }
  };

  // Função para adicionar um cliente
  const addCliente = async (cliente) => {
    if (!token) return; // Se não há token, não faz a requisição

    try {
      const response = await api.post('/cliente', cliente, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setClientes([...clientes, response.data]);
    } catch (error) {
      console.error('Erro ao adicionar cliente', error);
    }
  };

  // Função para adicionar um fornecedor
  const addFornecedor = async (fornecedor) => {
    if (!token) return; // Se não há token, não faz a requisição

    try {
      const response = await axios.post('/fornecedores', fornecedor, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFornecedores([...fornecedores, response.data]);
    } catch (error) {
      console.error('Erro ao adicionar fornecedor', error);
    }
  };

  // Função para adicionar uma conta a pagar
  const addContaAPagar = async (conta) => {
    if (!token) return; // Se não há token, não faz a requisição

    try {
      const response = await axios.post('/contasAPagar', conta, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setContasAPagar([...contasAPagar, response.data]);
    } catch (error) {
      console.error('Erro ao adicionar conta a pagar', error);
    }
  };

  // Função para deletar um cliente
  const deleteCliente = async (id) => {
    if (!token) return; // Se não há token, não faz a requisição

    try {
      await axios.delete(`/cliente/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setClientes(clientes.filter(cliente => cliente.id !== id));
    } catch (error) {
      console.error('Erro ao deletar cliente', error);
    }
  };

  // Função para deletar um fornecedor
  const deleteFornecedor = async (id) => {
    if (!token) return; // Se não há token, não faz a requisição

    try {
      await axios.delete(`/fornecedores/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFornecedores(fornecedores.filter(fornecedor => fornecedor.id !== id));
    } catch (error) {
      console.error('Erro ao deletar fornecedor', error);
    }
  };

  // Função para deletar uma conta a pagar
  const deleteContaAPagar = async (id) => {
    if (!token) return; // Se não há token, não faz a requisição

    try {
      await axios.delete(`/contasAPagar/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setContasAPagar(contasAPagar.filter(conta => conta.id !== id));
    } catch (error) {
      console.error('Erro ao deletar conta a pagar', error);
    }
  };

  // Função para atualizar um cliente
  const updateCliente = async (id, updatedData) => {
    if (!token) return; // Se não há token, não faz a requisição

    try {
      const response = await axios.put(`/cliente/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setClientes(clientes.map(cliente => (cliente.id === id ? response.data : cliente)));
    } catch (error) {
      console.error('Erro ao atualizar cliente', error);
    }
  };

  // Função para atualizar um fornecedor
  const updateFornecedor = async (id, updatedData) => {
    if (!token) return; // Se não há token, não faz a requisição

    try {
      const response = await axios.put(`/fornecedores/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setClientes(fornecedores.map(fornecedor => (fornecedor.id === id ? response.data : fornecedor)));
    } catch (error) {
      console.error('Erro ao atualizar fornecedor', error);
    }
  };

  // Função para atualizar uma conta a pagar
  const updateContaAPagar = async (id, updatedData) => {
    if (!token) return; // Se não há token, não faz a requisição

    try {
      const response = await axios.put(`/contasAPagar/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setContasAPagar(contasAPagar.map(conta => (conta.id === id ? response.data : conta)));
    } catch (error) {
      console.error('Erro ao atualizar conta a pagar', error);
    }
  };


  return (
    <DataContext.Provider
      value={{
        clientes,
        fornecedores,
        fetchClientes,
        fetchFornecedores,
        fetchContasAPagar,
        addCliente,
        addFornecedor,
        addContaAPagar,
        deleteCliente,
        deleteFornecedor,
        deleteContaAPagar,
        updateCliente,
        updateFornecedor,
        updateContaAPagar
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
