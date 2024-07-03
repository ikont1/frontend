import React from 'react';
import './Modal.css';

const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirmation-modal-buttons">
          <button className="cancel" onClick={onCancel}>Cancelar</button>
          <button className="confirm" onClick={onConfirm}>Remover</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
