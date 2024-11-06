import React from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';
import { BarChart2, Search } from 'react-feather';
import { useAccount } from '../../context/AccountContext';

const Header = () => {
  const { dadosEmpresa } = useAccount();
  const location = useLocation();

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
        {/* <span> <Bell />  </span>
        <span> <MessageSquare /> </span>
        <div>
          <div></div>
        </div> */}
        <h5>{dadosEmpresa?.data.conta.nomeFantasia || 'Empresa não encontrada'}</h5>
      </div>
    </header>
  );
};

export default Header;
