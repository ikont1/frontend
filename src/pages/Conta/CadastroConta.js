import React, { useState } from 'react';
import './Conta.css';
import { useAccount } from '../../context/AccountContext';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import { Link } from 'react-router-dom';

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
    <div className="cadastro-form">
      <form onSubmit={handleSubmit}>

        <div className="input-group" style={{ width: '100%' }} >
          <label htmlFor="nomeFantasia">Nome Fantasia</label>
          <input type="text" id="nomeFantasia" name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} required />
          {inputError.nomeFantasia && <span className="error-message">{inputError.nomeFantasia}</span>}
        </div>
        <div className="input-group" style={{ width: '48%' }}>
          <label htmlFor="cpfCnpj">CPF/CNPJ</label>
          <FormattedInput type="cpfCnpj" id="cpfCnpj" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} required />
          {inputError.cpfCnpj && <span className="error-message">{inputError.cpfCnpj}</span>}
        </div>
        <div className="input-group" style={{ width: '48%' }}>
          <label htmlFor="razaoSocial">Razão Social</label>
          <input type="text" id="razaoSocial" name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} required />
          {inputError.razaoSocial && <span className="error-message">{inputError.razaoSocial}</span>}
        </div>
        <div className="input-group" style={{ width: '30%' }}>
          <label htmlFor="naturezaJuridica">Natureza Jurídica</label>
          <input type="text" id="naturezaJuridica" name="naturezaJuridica" value={formData.naturezaJuridica} onChange={handleChange} required />
          {inputError.naturezaJuridica && <span className="error-message">{inputError.naturezaJuridica}</span>}
        </div>
        <div className="input-group" style={{ width: '30%' }}>
          <label htmlFor="porte">Porte</label>
          <input type="text" id="porte" name="porte" value={formData.porte} onChange={handleChange} required />
          {inputError.porte && <span className="error-message">{inputError.porte}</span>}
        </div>

        <div className="input-group" style={{ width: '30%' }}>
          <label htmlFor="cnae">CNAE</label>
          <input type="text" id="cnae" name="cnae" value={formData.cnae} onChange={handleChange} required />
          {inputError.cnae && <span className="error-message">{inputError.cnae}</span>}
        </div>
        <div className="input-group">
          <label htmlFor="dataAbertura">Data de Abertura</label>
          <input type="date" id="dataAbertura" name="dataAbertura" value={formData.dataAbertura} onChange={handleChange} required />
          {inputError.dataAbertura && <span className="error-message">{inputError.dataAbertura}</span>}
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


        <div className="container-reset-submit container-cadastro-button">
          <span>Ao clicar em continuar você estará aceitando nossos <Link to='/'>termos de uso.</Link></span>
          <button type="submit" disabled={loading} className='cadastro-button'>
            {loading ? 'Cadastrando...' : 'Cadastrar agora'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroConta;
