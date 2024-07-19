import React, { useState } from 'react';
import './Conta.css';
import logo from '../../assets/imgs/logosvg.svg';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { useAccount } from '../../context/AccountContext';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';

const CadastroConta = () => {
  const { cadastrarConta, loading } = useAccount();

  const [inputError, setInputError] = useState({});
  const [formData, setFormData] = useState({
    cpfCnpj: '',
    nomeFantasia: '',
    razaoSocial: '',
    naturezaJuridica: '',
    porte: '',
    dataAbertura: '',
    cnae: '',
    telefone: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setInputError({ ...inputError, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cadastrarConta(formData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-form">
        <img src={logo} alt="Logo" className="logo" />
        <h1>Cadastrar Conta</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <div className="input-group">
              <label htmlFor="cpfCnpj">CPF/CNPJ</label>
              <FormattedInput type="cpfCnpj" id="cpfCnpj" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} required />
              {inputError.cpfCnpj && <span className="error-message">{inputError.cpfCnpj}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="nomeFantasia">Nome Fantasia</label>
              <input type="text" id="nomeFantasia" name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} required />
              {inputError.nomeFantasia && <span className="error-message">{inputError.nomeFantasia}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="razaoSocial">Razão Social</label>
              <input type="text" id="razaoSocial" name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} required />
              {inputError.razaoSocial && <span className="error-message">{inputError.razaoSocial}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="naturezaJuridica">Natureza Jurídica</label>
              <input type="text" id="naturezaJuridica" name="naturezaJuridica" value={formData.naturezaJuridica} onChange={handleChange} required />
              {inputError.naturezaJuridica && <span className="error-message">{inputError.naturezaJuridica}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="porte">Porte</label>
              <input type="text" id="porte" name="porte" value={formData.porte} onChange={handleChange} required />
              {inputError.porte && <span className="error-message">{inputError.porte}</span>}
            </div>
          </div>
          <div>
            <div className="input-group">
              <label htmlFor="dataAbertura">Data de Abertura</label>
              <input type="date" id="dataAbertura" name="dataAbertura" value={formData.dataAbertura} onChange={handleChange} required />
              {inputError.dataAbertura && <span className="error-message">{inputError.dataAbertura}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="cnae">CNAE</label>
              <input type="text" id="cnae" name="cnae" value={formData.cnae} onChange={handleChange} required />
              {inputError.cnae && <span className="error-message">{inputError.cnae}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="telefone">Telefone</label>
              <FormattedInput type="telefone" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} required />
              {inputError.telefone && <span className="error-message">{inputError.telefone}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <FormattedInput type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
              {inputError.email && <span className="error-message">{inputError.email}</span>}
            </div>
          </div>

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

export default CadastroConta;
