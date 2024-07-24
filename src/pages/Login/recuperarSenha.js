import React, { useState } from 'react';
import './Login.css';
import logo from '../../assets/imgs/logosvg.svg';
import imgLogin from '../../assets/imgs/img-login.png';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import Modal from '../../components/Modal/Modal';
import CadastroConta from '../../pages/Conta/CadastroConta';


const RecuperarSenha = () => {
  const { resetPassword, loading } = useAuth();
  const [login, setLogin] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(login);
      setMessage('Te enviamos um e-mail com as orientações de redefinição de senha.');
      setSuccess(true);
    } catch (err) {
      setMessage('Erro ao enviar e-mail de redefinição. Verifique se o CPF/CNPJ está correto.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src={imgLogin} alt="Login" />
      </div>

      <div className="login-form">
        <img src={logo} alt="Logo" className="logo" />

        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <p>Digite seu CPF ou CNPJ abaixo e te enviaremos instruções de como criar uma nova senha.</p>
              <br></br>
              <label htmlFor="login">CPF ou CNPJ</label>
              <FormattedInput
                type="cpfCnpj"
                name="cpfCnpj"
                id="login"
                placeholder="CPF ou CNPJ"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>
            {message && <span className="error-message">{message}</span>}
            <div className="container-reset-submit">
              <Link to="/login" className="forgot-password">Voltar para entrar</Link>
              <button type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        ) : (
          <div className="success-message">
            <p>{message}</p>
            <button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Reenviando...' : 'Reenviar'}
            </button>
          </div>
        )}

        <div className="div-botton">
        <span className="register-link" onClick={handleOpenModal}>Não é cliente? Comece agora</span>
        <div className="social-media">
            <FaInstagram aria-hidden="true" className="i-sociais" />
            <FaWhatsapp aria-hidden="true" className="i-sociais" />
            <FaFacebook aria-hidden="true" className="i-sociais" />
            <FaYoutube aria-hidden="true" className="i-sociais" />
            <FaLinkedin aria-hidden="true" className="i-sociais" />
          </div>
        </div>
      </div>


      {/* Modal de cadastrar conta */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        size='large'
        title="Cadastre-se agora na iKont1">
        <CadastroConta />
      </Modal>
    </div>
  );
};

export default RecuperarSenha;
