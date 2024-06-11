// src/pages/Dashboard/Dashboard.js
import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <h1>Dashboard</h1>
        {/* Adicione os componentes do Dashboard aqui */}
      </div>
    </div>
  );
};

export default Dashboard;
