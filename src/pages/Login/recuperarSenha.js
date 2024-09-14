import React, { useState } from 'react';
import './Login.css';
import logo from '../../assets/imgs/logosvg.svg';
import imgLogin from '../../assets/imgs/img-login.png';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';

const RecuperarSenha = () => {
  const { resetPassword, loading } = useAuth();
  const [login, setLogin] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

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

export default RecuperarSenha;
