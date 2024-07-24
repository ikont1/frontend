import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Conta.css';
import { Briefcase, MapPin } from 'react-feather';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import { useAccount } from '../../context/AccountContext';
import ImgUser from '../../assets/imgs/imgUser.png';

const MinhaEmpresa = () => {
  const { listarContas } = useAccount();
  const [empresaData, setEmpresaData] = useState({
    cnpj: '',
    codigoNaturezaJuridica: '',
    razaoSocial: '',
    porteEmpresa: '',
    nomeFantasia: '',
    dataAbertura: '',
    endereco: {
      endereco: '',
      complemento: '',
      bairro: '',
      numero: '',
      cep: '',
      cidade: '',
      uf: ''
    },
    cnae: '',
    telefone: '',
    email: '',
    logoUrl: ''
});

// Função para buscar os dados da empresa do backend
const fetchEmpresaData = useRef(async () => {
  try {
    const response = await listarContas();
    if (response.data && response.data.conta) {
      const conta = response.data.conta;
      setEmpresaData({
        cnpj: conta.cpfCnpj || '',
        codigoNaturezaJuridica: conta.naturezaJuridica || '',
        razaoSocial: conta.razaoSocial || '',
        porteEmpresa: conta.porte || '',
        nomeFantasia: conta.nomeFantasia || '',
        dataAbertura: conta.dataAbertura || '',
        endereco: {
          endereco: conta.endereco.endereco || '',
          complemento: conta.endereco.complemento || '',
          bairro: conta.endereco.bairro || '',
          numero: conta.endereco.numero || '',
          cep: conta.endereco.cep || '',
          cidade: conta.endereco.cidade || '',
          uf: conta.endereco.uf || ''
        },
        cnae: conta.cnae || '',
        telefone: conta.telefone || '',
        email: conta.email || '',
        logoUrl: conta.logo.url || ''
      });
    } else {
      console.error('Estrutura de dados inesperada:', response.data);
    }
  } catch (error) {
    console.error('Erro ao buscar dados', error);
  }
}).current;

useEffect(() => {
  fetchEmpresaData();
}, [fetchEmpresaData]);

// Combinar os campos de endereço
const combinedAddress = `${empresaData.endereco.endereco || ''}, ${empresaData.endereco.bairro || ''}, ${empresaData.endereco.numero || ''}`;


return (
  <div className="container">
    <Sidebar />
    <div className="main-content">
      <Header />
      <div className="content empresa-container">
        <h1>Dados da Empresa</h1>
        <div className="section-header">
          <Briefcase />
          <div className="section-title">Dados básicos</div>
        </div>

        <div className='div1'>
          <div className="empresa-section">
            <div className="section-content">
              <div className="form-group-empresa2">
                <label htmlFor="cnpj">CNPJ</label>
                <FormattedInput type="cpfCnpj" id="cnpj" name="cnpj" value={empresaData.cnpj} readOnly />
              </div>
              <div className="form-group-empresa2">
                <label htmlFor="codigoNaturezaJuridica">Código e natureza jurídica</label>
                <input type="text" id="codigoNaturezaJuridica" name="codigoNaturezaJuridica" value={empresaData.codigoNaturezaJuridica} readOnly />
              </div>
              <div className="form-group-empresa2">
                <label htmlFor="razaoSocial">Razão Social</label>
                <input type="text" id="razaoSocial" name="razaoSocial" value={empresaData.razaoSocial} readOnly />
              </div>
              <div className="form-group-empresa2">
                <label htmlFor="porteEmpresa">Porte da Empresa</label>
                <input type="text" id="porteEmpresa" name="porteEmpresa" value={empresaData.porteEmpresa} readOnly />
              </div>
              <div className="form-group-empresa2">
                <label htmlFor="nomeFantasia">Nome fantasia</label>
                <input type="text" id="nomeFantasia" name="nomeFantasia" value={empresaData.nomeFantasia} readOnly />
              </div>
              <div className="form-group-empresa2">
                <label htmlFor="dataAbertura">Data de abertura</label>
                <FormattedInput type="data" id="dataAbertura" name="dataAbertura" value={empresaData.dataAbertura} readOnly />
              </div>
            </div>
          </div>

          {empresaData.logoUrl ? (
            <img src={empresaData.logoUrl} alt='Logo da empresa' className='empresa-logo' />
          ) : (
            <img src={ImgUser} alt='Imagem padrão' className='empresa-logo' />
          )}
        </div>

        <div className="empresa-section">
          <div className="section-header">
            <MapPin />
            <div className="section-title">Endereço</div>
          </div>
          <div className="section-content">
            <div className="form-group-empresa2">
              <label htmlFor="endereco">Logradouro, bairro, número</label>
              <input type="text" id="endereco" name="endereco" value={combinedAddress} readOnly />
            </div>
            <div className="form-group-empresa">
              <label htmlFor="cidade">Cidade</label>
              <input type="text" id="cidade" name="cidade" value={empresaData.endereco.cidade} readOnly />
            </div>
            <div className="form-group-empresa">
              <label htmlFor="uf">UF</label>
              <input type="text" id="uf" name="uf" value={empresaData.endereco.uf} readOnly />
            </div>
            <div className="form-group-empresa">
              <label htmlFor="cep">CEP</label>
              <FormattedInput type="cep" id="cep" name="cep" value={empresaData.endereco.cep} readOnly />
            </div>
            <div className="form-group-empresa">
              <label htmlFor="complemento">Complemento</label>
              <input type="text" id="complemento" name="complemento" value={empresaData.endereco.complemento} readOnly />
            </div>
            <div className="form-group-empresa">
              <label htmlFor="cnae">CNAE</label>
              <input type="text" id="cnae" name="cnae" value={empresaData.cnae} readOnly />
            </div>
            <div className="form-group-empresa">
              <label htmlFor="telefone">Telefone</label>
              <FormattedInput type="telefone" id="telefone" name="telefone" value={empresaData.telefone} readOnly />
            </div>
            <div className="form-group-empresa">
              <label htmlFor="email">E-mail</label>
              <FormattedInput type="email" id="email" name="email" value={empresaData.email} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default MinhaEmpresa;
