import React, { useState, useEffect } from 'react';
import { X, Zap, XCircle } from 'react-feather';
import './Modal.css';
import { useWallet } from '../../context/WalletContext';
import Notification from '../../components/Notification/Notification';
import Lottie from 'react-lottie';
import animationData from '../../lottieflow-scrolling-01-1-ffffff-easey.json';

const IntegracaoModal = ({ isOpen, onClose, conta }) => {
  const { integrarConta } = useWallet();
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: '',
    icon: null,
    buttons: [],
  });

  // Reseta o estado toda vez que o modal é aberto ou fechado
  useEffect(() => {
    if (!isOpen) {
      // Resetar os campos e o step
      setStep(1);
      setClientId('');
      setClientSecret('');
      // Limpar notificações
      setShowNotification(false);
      setNotificationData({
        title: '',
        message: '',
        type: '',
        icon: null,
        buttons: [],
      });
    }
  }, [isOpen]);

  const handleConfirm = () => setStep(2);

  const handleSubmit = async () => {
    if (!clientId || !clientSecret) {
      setNotificationData({
        title: 'Atenção',
        message: 'Por favor, preencha todos os campos.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
      return;
    }

    setLoading(true);

    try {
      await integrarConta(conta.id, { clientId, clientSecret });

      setNotificationData({
        title: 'Sucesso',
        message: 'Conta integrada com sucesso!',
        type: 'success',
        icon: Zap,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
      onClose(); // Fecha o modal após sucesso
    } catch (error) {
      setNotificationData({
        title: 'Erro',
        message: 'Credenciais inválidas. Verifique e tente novamente.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = () => {
    window.open('https://wa.me/5586994530553', '_blank');
    onClose();
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

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
                <div>
                  <span className="agencia">{conta.agencia}</span>
                  <span className="conta">{conta.numeroConta}</span>
                </div>
                <p>R${conta.saldoInicial}</p>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <>
              <div className="detalhes-text">
                <p>Você confirma que possui as credenciais do Banco para autorizar a integração?</p>
              </div>
              <div className="modal-integracao-footer">
                <button className="cancel" onClick={handleSupport}>
                  Não, preciso de suporte.
                </button>
                <button className="confirm-button" onClick={handleConfirm}>
                  <Zap className="icon" /> Sim, possuo as credenciais.
                </button>
              </div>
            </>
          ) : (
            <>
              <p>Preencha as credenciais para concluir a integração:</p>
              <input
                type="text"
                placeholder="Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              />
              <br />
              <br />
              <input
                type="password"
                placeholder="Client Secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                required
              />
              <div className="modal-integracao-footer">
                <button className="confirm-button" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <Lottie options={defaultOptions} height={20} width={20} />
                  ) : (
                    <span>
                      <Zap className="icon" /> Conectar
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {showNotification && (
        <Notification
          title={notificationData.title}
          message={notificationData.message}
          type={notificationData.type}
          icon={notificationData.icon}
          buttons={notificationData.buttons}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default IntegracaoModal;
