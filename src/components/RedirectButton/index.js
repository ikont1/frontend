// RedirectButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle } from 'react-feather';
import './RedirectButton.css'; 

const RedirectButton = ({ route = '/', tooltipText = 'Voltar para dashboard', className = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route); // Navega para a rota dinâmica
  };

  return (
    <div className={`tooltip-container ${className}`}>
      <button className="redirect-button" onClick={handleClick}>
        <ArrowLeftCircle className="icon" />
      </button>
      <span className="tooltip-text">{tooltipText}</span>
    </div>
  );
};

export default RedirectButton;