import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const UsersContext = createContext();

export const useUsers = () => useContext(UsersContext);

export const UsersProvider = ({ children }) => {
  const [modulos, setModulos] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listar módulos
  const listarModulos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/usuario/perfil/modulos');
      setModulos(response.data?.data?.modulos || []);
    } catch (err) {
      setError('Erro ao listar módulos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Listar perfis
  const listarPerfis = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/usuario/perfil');
      setPerfis(response.data?.data?.perfil || []);
    } catch (err) {
      setError('Erro ao listar perfis');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obter perfil específico por ID
  const obterPerfilPorId = async (perfilId) => {
    setLoading(true);
    try {
      const response = await api.get(`/usuario/perfil/${perfilId}`);
      return response.data?.data || null;
    } catch (err) {
      setError('Erro ao obter perfil');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Criar perfil
  const criarPerfil = async (perfilData) => {
    setLoading(true);
    try {
      const response = await api.post('/usuario/perfil', perfilData);
      await listarPerfis();  // Chama listarPerfis para atualizar a lista
      return response.data;
    } catch (err) {
      console.error(err);
      setError('Erro ao criar perfil');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Editar um perfil
  const editarPerfil = async (perfilId, perfilData) => {
    try {
      await api.patch(`/usuario/perfil/${perfilId}`, perfilData);
      await listarPerfis();  // Atualizar lista após edição
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error[0]?.message || 'Erro ao editar perfil' };
    }
  };

  // Excluir perfil
  const excluirPerfil = async (perfilId) => {
    try {
      await api.delete(`/usuario/perfil/${perfilId}`);
      await listarPerfis();  // Atualizar lista após exclusão
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao excluir o perfil.' };
    }
  };

  // Listar usuarios
  const listarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/usuario');
      setUsuarios(response.data?.data?.usuarios || []);
    } catch (err) {
      setError('Erro ao listar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cadastrar usuario
  const cadastrarUsuario = async (usuarioData) => {
    setLoading(true);
    try {
      await api.post('/usuario', usuarioData);
      await listarUsuarios();  // Atualizar lista após criação
      return { success: true };
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      return { success: false, error: error.response?.data?.message || "Erro desconhecido" };
    } finally {
      setLoading(false);
    }
  };

  // Função para editar usuário
  const editarUsuario = async (usuarioId, usuarioData) => {
    setLoading(true);
    try {
      await api.patch(`/usuario/${usuarioId}`, usuarioData);
      await listarUsuarios();  // Atualizar lista após edição
      return { success: true };
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
      return { success: false, error: error.response?.data?.message || "Erro desconhecido" };
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar usuário
  const deletarUsuario = async (usuarioId) => {
    setLoading(true);
    try {
      await api.delete(`/usuario/${usuarioId}`);
      await listarUsuarios();  // Atualizar lista após exclusão
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return { success: false, error: error.response?.data?.message || "Erro desconhecido" };
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar os dados iniciais de módulos, perfis e usuários
  useEffect(() => {
    listarModulos();
    listarPerfis();
    listarUsuarios();
  }, [listarModulos, listarPerfis, listarUsuarios]);

  return (
    <UsersContext.Provider value={{
      loading,
      error,
      modulos,
      perfis,
      listarPerfis,
      criarPerfil,
      obterPerfilPorId,
      editarPerfil,
      excluirPerfil,
      usuarios,
      listarUsuarios,
      cadastrarUsuario,
      editarUsuario,
      deletarUsuario
    }}>
      {children}
    </UsersContext.Provider>
  );
};
