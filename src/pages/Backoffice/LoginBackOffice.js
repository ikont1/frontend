import React, { useState, useEffect } from 'react';
import logo from '../../assets/imgs/logosvg.svg';
import imgLogin from '../../assets/imgs/img-login.png';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import Notification from '../../components/Notification/Notification';

const LoginBackOffice = () => {
  const { login, loading, error, setNotification } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [inputError, setInputError] = useState({});

  useEffect(() => {
    if (error) {
      setInputError({ email: true, senha: true });
    } else {
      setInputError({});
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, senha);
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
            <label htmlFor="email" className={inputError.email ? 'error-label' : ''}>Email</label>
            <FormattedInput
              type="email"
              name="email"
              id="email"
              className={inputError.email ? 'error-input' : ''}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setInputError({ ...inputError, email: false });
              }}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password" className={inputError.senha ? 'error-label' : ''}>Senha</label>
            <div className="password-wrapper">
              <FormattedInput
                type="senha"
                name="senha"
                id="password"
                className={inputError.senha ? 'error-input' : ''}
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setInputError({ ...inputError, senha: false });
                }}
                required
              />
            </div>
          </div>

          {error && !['Sua conta está temporariamente inativa!', 'Problemas de conexão com internet!', 'Erro no servidor!'].includes(error) && (
            <p className="error-message">{error}</p>
          )}

          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Lembrar dados?</label>
          </div>

          <div className="container-reset-submit">
            <Link to="/recuperar-senha" className="forgot-password">Esqueceu a senha?</Link>
            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <div className="div-botton">
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

      {error && ['Sua conta está temporariamente inativa!', 'Problemas de conexão com internet!', 'Erro no servidor!'].includes(error) && (
        <Notification
          title={error.includes('inativa') ? 'Sua conta está temporariamente inativa!' : error.includes('conexão') ? 'Problemas de conexão com internet!' : 'Erro no servidor!'}
          message={error.includes('inativa') ? 'Entre em contato com o nosso suporte para obter assistência.' : error.includes('conexão') ? 'Houve um problema de conexão. Por favor, verifique sua internet e tente novamente.' : 'Desculpe, ocorreu um erro no servidor. Por favor, tente novamente mais tarde.'}
          type="error"
          buttons={error.includes('inativa') ? [
            { label: 'Falar com suporte', onClick: () => window.open('https://wa.me/5511999999999', '_blank') },
            { label: 'Sair', onClick: () => setNotification(null) }
          ] : [
            { label: 'Sair', onClick: () => setNotification(null) }
          ]}
        />
      )}
    </div>
  );
};

export default LoginBackOffice;
