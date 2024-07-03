import React, { useState } from 'react';
import './Usuario.css';
import logo from '../../assets/imgs/logosvg.svg';
import imgLogin from '../../assets/imgs/img-login.png';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';

const CadastroUsuario = () => {
  const { cadastrarUsuario, loading, error } = useAuth();
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [inputError, setInputError] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    await cadastrarUsuario(cpfCnpj, email, nome);
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src={imgLogin} alt="Login" />
      </div>

      <div className="login-form">
        <img src={logo} alt="Logo" className="logo" />
        <h1>Cadastrar Usuário</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="cpf-cnpj" className={inputError.cpfCnpj ? 'error-label' : ''}>CPF ou CNPJ</label>
            <FormattedInput
              type="cpfCnpj"
              name="cpfCnpj"
              id="cpf-cnpj"
              className={inputError.cpfCnpj ? 'error-input' : ''}
              value={cpfCnpj}
              onChange={(e) => {
                setCpfCnpj(e.target.value);
                setInputError({ ...inputError, cpfCnpj: false });
              }}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="nome">Nome</label>
            <div className="password-wrapper">
              <input
                type="text"
                name="nome"
                id="nome"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                }}
                required
              />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="password-wrapper">
              <input
                type="email"
                name="email"
                id="email"
                className={inputError.email ? 'error-input' : ''}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required
              />
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="container-reset-submit">
            <button type="submit" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>

        <div className="div-botton">
          <div className="social-media">
            <FaInstagram aria-hidden="true" className="i-sociais" />
            <FaWhatsapp aria-hidden="true" className="i-sociais" />
            <FaFacebook aria-hidden="true" className="i-sociais" />
            <FaYoutube aria-hidden="true" className="i-sociais" />
            <FaLinkedin aria-hidden="true" className="i-sociais" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroUsuario;
