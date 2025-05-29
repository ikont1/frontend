import React from 'react';
import './Modal.css';

const ConfirmationModal = ({ title, message, secondaryMessage,onConfirm, onCancel }) => {
  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <p>{secondaryMessage}</p>
        <div className="confirmation-modal-buttons">
          <button className="cancel" onClick={onCancel}>Cancelar</button>
          <button className="confirm" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
