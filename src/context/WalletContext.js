import React, { createContext, useContext } from 'react';
import api from '../services/api';

export const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const listarContas = async () => {
    try {
      const response = await api.get('/conta-bancaria');
      return response.data.data.contas;
    } catch (error) {
      console.error('Erro ao listar contas:', error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider value={{ listarContas }}>
      {children}
    </WalletContext.Provider>
  );
};
