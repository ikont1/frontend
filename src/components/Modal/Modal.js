import React from 'react';
import { X } from 'react-feather';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, size }) => {
  if (!isOpen) {
    return null;
  }

  // Define o tamanho padrão do modal se a prop 'size' não for fornecida
  const modalSizeClass = size === 'large' ? 'modal-content large' : 'modal-content';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={modalSizeClass} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
