import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';
import { BarChart2, Bell, Search, MessageSquare } from 'react-feather';
import { useAccount } from '../../context/AccountContext'; // Importa o contexto corretamente

const Header = () => {
  const { listarContas } = useAccount(); // Função do contexto para buscar as contas
  const location = useLocation();

  const [dados, setDados] = useState(null); // Estado para armazenar os dados da empresa

  // Função para buscar e armazenar os dados da empresa
  useEffect(() => {
    const fetchDadosUsuario = async () => {
      try {
        const response = await listarContas();
        if (response.data && response.data.conta) {
          setDados(response.data.conta);
        }
      } catch (error) {
        console.error('Erro ao buscar contas:', error);
      }
    };
  
    fetchDadosUsuario();
  }, [listarContas]); // Adicione listarContas como dependência
  

  return (
    <header className="header">
      <div className="left">
        <button>
          <BarChart2 /> Financeiro
        </button>
        {(location.pathname === '/' ||
          location.pathname === '/clientes-fornecedores' ||
          location.pathname === '/minha-empresa') && (
          <div className="search-div">
            <Search />
            <input
              id="pesquisar"
              type="text"
              placeholder="Pesquisar"
              className="search-input"
            />
          </div>
        )}
      </div>

      <div className="right">
        <span>
          <Bell />
        </span>
        <span>
          <MessageSquare />
        </span>
        <div>
          <div></div>
        </div>
        <h5>{dados?.nomeFantasia || 'Empresa não encontrada'}</h5>
      </div>
    </header>
  );
};

export default Header;
