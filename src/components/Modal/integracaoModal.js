// src/components/IntegracaoModal/IntegracaoModal.js
import React from 'react';
import { X, Zap } from 'react-feather';

import './Modal.css';

const IntegracaoModal = ({ isOpen, onClose, conta, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay modal-integracao-overlay">
      <div className="modal-content modal-integracao-content">

        <div className="modal-integracao-header">
          <h2>
            <Zap className="icon" /> Habilitação integração automática da conta {conta.nomeBanco}
          </h2>
          <button className="close-button" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="modal-integracao-body">
          <div className="detalhes-header">
            <img src={conta.bancoLogo} alt="Banco Logo" className="banco-logo" />
            <div className="banco-info-detalhes">
              <h3>{conta.nomeBanco}</h3>
              <div className="banco-dados-detalhes">
                <span className="agencia">{conta.agencia}</span>
                <span className="conta">{conta.numeroConta}</span>
                <p>R${conta.saldoInicial}</p>
              </div>
            </div>
          </div>

          <div className='detalhes-text'>
            <p>Para finalizar a integração precisamos que autorize a integração da iKont1 com a sua conta digital.</p>
            <br></br>
            <p>Clique em “Autorizar integração” e redirecionaremos você para a página de autorização da sua conta. Depois, basta seguir os passos e pronto, tudo integrado!</p>
          </div>
        </div>

        <div className="modal-integracao-footer">
          <button className="cancel" onClick={onClose}>Cancelar</button>
          <button className="confirm-button" onClick={onConfirm}><Zap className="icon" /> Autorizar integração</button>
        </div>
      </div>
    </div>
  );
};

export default IntegracaoModal;
