// src/pages/Carteira/Carteira.js
import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './Carteira.css';

const Carteira = () => {
  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <h1>Carteira</h1>
        {/* Adicione os componentes da Carteira aqui */}
      </div>
    </div>
  );
};

export default Carteira;
