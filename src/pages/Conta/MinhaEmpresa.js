import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Conta.css';
import { Briefcase, MapPin } from 'react-feather';
import { BiPencil } from 'react-icons/bi';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import { useAccount } from '../../context/AccountContext';
import ImgUser from '../../assets/imgs/imgUser.png';
import Modal from '../../components/Modal/Modal';

const MinhaEmpresa = () => {
  const { listarContas, atualizarConta } = useAccount();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ endereco: {} });

  const [empresaData, setEmpresaData] = useState({
    cnpj: '',
    naturezaJuridica: '',
    razaoSocial: '',
    porte: '',
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
          naturezaJuridica: conta.naturezaJuridica || '',
          razaoSocial: conta.razaoSocial || '',
          porte: conta.porte || '',
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

  // Editar conta
  const handleEditClick = () => {
    setEditData({ ...empresaData });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      endereco: {
        ...prevData.endereco,
        [name]: value
      }
    }));
  };


  // Função para atualizar os dados
  const handleUpdate = async () => {
    try {
      // Verificar se todos os campos de endereço estão presentes
      const updatedEndereco = {
        endereco: editData.endereco.endereco || '',
        complemento: editData.endereco.complemento || '',
        bairro: editData.endereco.bairro || '',
        numero: editData.endereco.numero || '',
        cep: editData.endereco.cep || '',
        cidade: editData.endereco.cidade || '',
        uf: editData.endereco.uf || ''
      };

      // Verificar se todos os campos obrigatórios estão preenchidos
      if (
        !updatedEndereco.bairro ||
        !updatedEndereco.numero ||
        !updatedEndereco.cep ||
        !updatedEndereco.cidade
      ) {
        alert('Preencha todos os campos obrigatórios do endereço.');
        return;
      }

      const updatedData = {
        nomeFantasia: editData.nomeFantasia,
        razaoSocial: editData.razaoSocial,
        naturezaJuridica: editData.naturezaJuridica,
        porte: editData.porte,
        cnae: editData.cnae,
        email: editData.email,
        telefone: editData.telefone,
        endereco: updatedEndereco
      };

      await atualizarConta(updatedData);
      setIsEditModalOpen(false);
      fetchEmpresaData();
    } catch (error) {
      console.error('Erro ao atualizar dados da empresa:', error);
    }
  };


  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content empresa-container">
          <h1>Dados da Empresa <BiPencil className='icon' onClick={handleEditClick} /></h1>
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
                  <label htmlFor="naturezaJuridica">Código e natureza jurídica</label>
                  <input type="text" id="naturezaJuridica" name="naturezaJuridica" value={empresaData.naturezaJuridica} readOnly />
                </div>
                <div className="form-group-empresa2">
                  <label htmlFor="razaoSocial">Razão Social</label>
                  <input type="text" id="razaoSocial" name="razaoSocial" value={empresaData.razaoSocial} readOnly />
                </div>
                <div className="form-group-empresa2">
                  <label htmlFor="porte">Porte da Empresa</label>
                  <input type="text" id="porte" name="porte" value={empresaData.porte} readOnly />
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

      {/* Modal de ecição */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleUpdate}
        title="Editar Dados da Empresa"
      >
        {/* Campos de edição */}
        <div className="form-group">
          <label htmlFor="nomeFantasia">Nome Fantasia</label>
          <input type="text" id="nomeFantasia" name="nomeFantasia" value={editData.nomeFantasia} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="razaoSocial">Razão Social</label>
          <input type="text" id="razaoSocial" name="razaoSocial" value={editData.razaoSocial} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="naturezaJuridica">Natureza Jurídica</label>
          <input type="text" id="naturezaJuridica" name="naturezaJuridica" value={editData.naturezaJuridica} onChange={handleInputChange} required />
        </div>
        <div className='form-group-modal'>
          <div className="form-group">
            <label htmlFor="porte">Porte</label>
            <input type="text" id="porte" name="porte" value={editData.porte} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="cnae">CNAE</label>
            <input type="text" id="cnae" name="cnae" value={editData.cnae} onChange={handleInputChange} required />
          </div>
        </div>
        <div className='form-group-modal'>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="text" id="email" name="email" value={editData.email} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <FormattedInput type="telefone" id="telefone" name="telefone" value={editData.telefone} onChange={handleInputChange} required />
          </div>
        </div>
        <div style={{borderTop: '1px solid #DEDEDE', paddingTop: '20px',marginTop: '20px'}} className="form-group">
          <label htmlFor="endereco">Endereço</label>
          <input type="text" id="endereco" name="endereco" value={editData.endereco.endereco} onChange={handleAddressChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="complemento">Complemento</label>
          <input type="text" id="complemento" name="complemento" value={editData.endereco.complemento} onChange={handleAddressChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="bairro">Bairro</label>
          <input type="text" id="bairro" name="bairro" value={editData.endereco.bairro} onChange={handleAddressChange} required />
        </div>
        <div className='form-group-modal'>
          <div className="form-group">
            <label htmlFor="numero">Número</label>
            <input type="text" id="numero" name="numero" value={editData.endereco.numero} onChange={handleAddressChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="cep">CEP</label>
            <FormattedInput type="cep" id="cep" name="cep" value={editData.endereco.cep} onChange={handleAddressChange} required />
          </div>
        </div>
        <div className='form-group-modal'>
          <div className="form-group">
            <label htmlFor="cidade">Cidade</label>
            <input type="text" id="cidade" name="cidade" value={editData.endereco.cidade} onChange={handleAddressChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="uf">UF</label>
            <input type="text" id="uf" name="uf" value={editData.endereco.uf} onChange={handleAddressChange} required />
          </div>
        </div>

        {/* Botão de salvar */}
        <div className="form-group">
          <button type="button" onClick={handleUpdate}>Salvar</button>
        </div>
      </Modal>


    </div>
  );
};

export default MinhaEmpresa;
