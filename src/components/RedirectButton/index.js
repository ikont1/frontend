// RedirectButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle } from 'react-feather';
import './RedirectButton.css'; 

const RedirectButton = ({ tooltipText = 'Voltar para dashboard', className = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/'); 
  };

  return (
    <div className={`tooltip-container ${className}`}>
      <button className="redirect-button" onClick={handleClick}>
        <ArrowLeftCircle className="icon" />
      </button>
      <span className="tooltip-text">{tooltipText}</span> {/* Texto do hover */}
    </div>
  );
};

export default RedirectButton;
