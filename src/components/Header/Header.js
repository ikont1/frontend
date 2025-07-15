import React from 'react';
import './Header.css';
import { BarChart2 } from 'react-feather';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { decodedToken } = useAuth();

  return (
    <header className="header">
      <div className="left">
        <button>
          <BarChart2 /> Financeiro
        </button>
        
      </div>

      <div className="right">
        {/* <span> <Bell />  </span>
        <span> <MessageSquare /> </span>
        <div>
          <div></div>
        </div> */}
        <h5>{decodedToken?.usuario?.nome || 'Usuário não encontrada'}</h5>
      </div>
    </header>
  );
};

export default Header;
