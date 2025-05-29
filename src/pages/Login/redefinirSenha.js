import React, { useState, useEffect } from 'react';
import './Login.css';
import logo from '../../assets/imgs/logosvg.svg';
import imgLogin from '../../assets/imgs/img-login.png';
import { Link, useLocation } from 'react-router-dom';
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';

const RedefinirSenha = () => {
  const { setPassword, loading, error } = useAuth();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmeNovaSenha, setConfirmeNovaSenha] = useState('');
  const [inputError, setInputError] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [showResetLink, setShowResetLink] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
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

    try {
      setErrorMessage('');
      setShowResetLink(false);

      const response = await setPassword(token, novaSenha, confirmeNovaSenha);

      if (response && response.success) {
      } else {
        setErrorMessage(response.message || 'Erro ao redefinir senha. Verifique os dados e tente novamente.');
      }
    } catch (err) {
      setShowResetLink(true);
    }
  };


  return (
    <div className="login-container">
      <div className="login-image">
        <img src={imgLogin} alt="Login" />
      </div>

      <div className="login-form">
        <img src={logo} alt="Logo" className="logo" />

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

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {showResetLink && (
            <p className="error-message">
              <Link to="/recuperar-senha" className="reset-link"> Clique aqui e solicite um novo link de criação/redefinição de senha no seu e-mail.</Link>
            </p>
          )}
          <div className="container-reset-submit">
            <button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>

        <div className="div-botton">
          <Link to='https://ikont1.com.br/#planos' className="register-link" target="_blank" rel="noopener noreferrer">
            Não é cliente? Comece agora
          </Link>
          <div className="social-media">
            <Link to='https://www.instagram.com/ikont1/' target="_blank" rel="noopener noreferrer">
              <FaInstagram aria-hidden="true" className="i-sociais" />
            </Link>
            <Link to='https://api.whatsapp.com/send/?phone=5586994530553&text&type=phone_number&app_absent=0' target="_blank" rel="noopener noreferrer">
              <FaWhatsapp aria-hidden="true" className="i-sociais" />
            </Link>
            <Link to='https://www.facebook.com/profile.php?id=61560873020631' target="_blank" rel="noopener noreferrer">
              <FaFacebook aria-hidden="true" className="i-sociais" />
            </Link>
            <Link to='https://www.linkedin.com/company/ikont1' target="_blank" rel="noopener noreferrer">
              <FaLinkedin aria-hidden="true" className="i-sociais" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;
