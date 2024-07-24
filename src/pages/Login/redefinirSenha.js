import React, { useState, useEffect } from 'react';
import './Login.css';
import logo from '../../assets/imgs/logosvg.svg';
import imgLogin from '../../assets/imgs/img-login.png';
import { Link, useLocation } from 'react-router-dom';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import Modal from '../../components/Modal/Modal';
import CadastroConta from '../../pages/Conta/CadastroConta';



const RedefinirSenha = () => {
  const { setPassword, login, loading, error } = useAuth();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmeNovaSenha, setConfirmeNovaSenha] = useState('');
  const [inputError, setInputError] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const location = useLocation();

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };


  useEffect(() => {
    if (error) {
      setInputError({ novaSenha: true, confirmeNovaSenha: true });
    } else {
      setInputError({});
    }
  }, [error]);

  const getTokenFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('token');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmeNovaSenha) {
      setErrorMessage('As senhas não coincidem. Por favor, verifique e tente novamente.');
      return;
    }
    const token = getTokenFromUrl();
    await setPassword(token, novaSenha, confirmeNovaSenha);
    if (!error) {
      const tempLogin = localStorage.getItem('tempLogin');
      if (tempLogin) {
        await login(tempLogin, novaSenha);
        setSuccess(true);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src={imgLogin} alt="Login" />
      </div>

      <div className="login-form">
        <img src={logo} alt="Logo" className="logo" />
        {success ? (
          <div className="success-message">
            <p>Sua senha foi redefinida com sucesso. Você será redirecionado para a página inicial.</p>
            <Link to="/" className="login-button">Ir para a Home</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="password" className={inputError.novaSenha ? 'error-label' : ''}>Nova senha</label>
              <div className="password-wrapper">
                <FormattedInput
                  type="senha"
                  name="senha"
                  id="password"
                  className={inputError.novaSenha ? 'error-input' : ''}
                  placeholder="Nova senha"
                  value={novaSenha}
                  onChange={(e) => {
                    setNovaSenha(e.target.value);
                    setInputError({ ...inputError, novaSenha: false });
                    setErrorMessage('');
                  }}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password2" className={inputError.confirmeNovaSenha ? 'error-label' : ''}>Confirmar senha</label>
              <div className="password-wrapper">
                <FormattedInput
                  type="senha"
                  name="senha2"
                  id="password2"
                  className={inputError.confirmeNovaSenha ? 'error-input' : ''}
                  placeholder="Confirmar nova senha"
                  value={confirmeNovaSenha}
                  onChange={(e) => {
                    setConfirmeNovaSenha(e.target.value);
                    setInputError({ ...inputError, confirmeNovaSenha: false });
                    setErrorMessage('');
                  }}
                  required
                />
              </div>
            </div>
            {error && <p className="error-message">{error}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="container-reset-submit">
              <button type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
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

export default RedefinirSenha;
