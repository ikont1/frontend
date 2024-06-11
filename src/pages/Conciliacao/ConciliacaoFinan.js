// src/pages/Conciliacao/Conciliacao.js
import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './Conciliacao.css';

const ConciliacaoFinan = () => {
  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <h1>Conciliação financeira</h1>
        {/* Adicione os componentes da Conciliação aqui */}
      </div>
    </div>
  );
};

export default ConciliacaoFinan;
