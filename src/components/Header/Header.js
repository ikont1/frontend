import React from 'react';
import './Header.css';
import { BarChart2, Bell, Search, MessageSquare, Circle, ChevronDown } from 'react-feather';


const Header = () => {
  return (
    <header className="header">
      <div className="left">
        <button> <BarChart2 /> Financeiro</button>
        <div className='search-div'>
          <Search/>
          <input type="text" placeholder="Pesquisar" className="search-input" />
        </div>
      </div>

      <div className="right">
        <span><Bell/></span>
        <span><MessageSquare/></span>
        <span><Circle/></span>
        <p>Instituto Contábil <ChevronDown/></p>
      </div>
    </header>
  );
};

export default Header;
