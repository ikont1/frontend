import React from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';
import { BarChart2, Bell, Search, MessageSquare } from 'react-feather';


const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="left">
        <button> <BarChart2 />Financeiro</button>
        {(location.pathname === '/' ||
          location.pathname === '/clientes-fornecedores' ||
          location.pathname === '/minha-empresa') && (
            <div className='search-div'>
              <Search />
              <input id='pesquisar' type="text" placeholder="Pesquisar" className="search-input" />
            </div>
          )}
      </div>

      <div className="right">
        <span><Bell /></span>
        <span><MessageSquare /></span>
        <div><div></div></div>
        <select style={{background: 'transparent', padding: 0}}>
          <option>Instituto Contábil</option>
          <option>Lorem</option>
          <option>Lorem</option>
        </select>
      </div>
    </header>
  );
};

export default Header;
