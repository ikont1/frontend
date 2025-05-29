import React, { useState } from 'react';
import { useClientSupplier } from '../../context/ClientSupplierContext';
import './ClientesFornecedores.css';
import axios from 'axios'; // Importando axios
import { ThumbsUp, AlertTriangle } from 'react-feather';
import Notification from '../../components/Notification/Notification';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';

const FornecedorForm = ({ initialData = {}, onClose, fetchData }) => {
  const { addFornecedor, updateFornecedor } = useClientSupplier();

  const [formData, setFormData] = useState({
    nomeFantasia: initialData.nomeFantasia || '',
    cpfCnpj: initialData.cpfCnpj || '',
    razaoSocial: initialData.razaoSocial || '',
    inscricalMunicipal: initialData.inscricalMunicipal || '',
    inscricalEstadual: initialData.inscricalEstadual || '',
    email: initialData.email || '',
    telefone: initialData.telefone || '',
  });

  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchCnpjData = async (cnpj) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length === 14) {
      try {
        const { data } = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
        setFormData((formData) => ({
          ...formData,
          razaoSocial: data.razao_social || '',
          nomeFantasia: data.nome_fantasia || '',
          telefone: data.ddd_telefone_1 || '',
          email: data.email || '',
        }));
        setErrors((prevErrors) => ({ ...prevErrors, cpfCnpj: '' }));
      } catch (error) {
        setFormData((formData) => ({
          ...formData,
          razaoSocial: '',
          nomeFantasia: '',
          telefone: '',
          email: '',
        }));
        setErrors((prevErrors) => ({
          ...prevErrors,
          cpfCnpj: 'CNPJ inválido ou não encontrado.',
        }));
      }
    }
  };

  const handleNotificationClose = () => {
    setNotification(null);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    const cleanValue = formData.cpfCnpj.replace(/\D/g, '');
  
    if (!formData.cpfCnpj) {
      newErrors.cpfCnpj = 'CNPJ/CPF é obrigatório';
    } else if (cleanValue.length !== 11 && cleanValue.length !== 14) {
      newErrors.cpfCnpj = 'Digite um CNPJ ou CPF válido';
    }
  
    if (cleanValue.length === 14 && !formData.nomeFantasia) {
      newErrors.nomeFantasia = 'Nome Fantasia é obrigatório para CNPJ';
    }
  
    if (!formData.razaoSocial) {
      newErrors.razaoSocial = 'Nome ou Razão Social é obrigatória';
    }
  
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    }
  
    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
  
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    // Copiar o formData para um novo objeto
    const dataToSubmit = { ...formData };
  
    // Remover campos vazios
    if (!dataToSubmit.inscricalMunicipal) {
      delete dataToSubmit.inscricalMunicipal;
    }
    if (!dataToSubmit.inscricalEstadual) {
      delete dataToSubmit.inscricalEstadual;
    }

    try {
      if (initialData.id) {
        await updateFornecedor(initialData.id, dataToSubmit);
        setNotification({
          title: 'Tudo certo!',
          message: 'As informações do fornecedor foram atualizadas.',
          type: 'success',
          icon: ThumbsUp,
          buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
        });
      } else {
        await addFornecedor(dataToSubmit);
        setNotification({
          title: 'Fornecedor cadastrado com sucesso!',
          message: 'Oba! Seu cadastro foi bem-sucedido!',
          type: 'success',
          icon: ThumbsUp,
          buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
        });
      }
      fetchData(); // Atualiza os dados após adicionar ou editar
    } catch (error) {
      setNotification({
        title: 'Erro ao salvar fornecedor',
        message: 'Houve um problema ao salvar as informações do fornecedor.',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    }
  };
  
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cpfCnpj">CNPJ ou CPF</label>
          <FormattedInput type="cpfCnpj" id="cpfCnpj" placeholder="Campo obrigatório" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} onBlur={(e) => fetchCnpjData(e.target.value)} />
          {errors.cpfCnpj ? (
            <span style={{ color: 'red', fontSize: '10px' }}>{errors.cpfCnpj}</span>
          ) : (
            <span>Digite um CNPJ ou CPF válido.</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="nomeFantasia">Nome Fantasia</label>
          <input type="text" id="nomeFantasia" name="nomeFantasia" placeholder="Campo obrigatório para cnpj" value={formData.nomeFantasia} onChange={handleChange} />
          {errors.nomeFantasia ? (
            <span style={{ color: 'red', fontSize: '10px' }}>{errors.nomeFantasia}</span>
          ) : (
            <span>Nome Fantasia é obrigatório para CNPJ</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="razaoSocial">Nome ou Razão Social</label>
          <input type="text" id="razaoSocial" name="razaoSocial" placeholder="Campo obrigatório" value={formData.razaoSocial} onChange={handleChange} />
          {errors.razaoSocial ? (
            <span style={{ color: 'red', fontSize: '10px' }}>{errors.razaoSocial}</span>
          ) : (
            <span>O nome da Empresa deve ter entre 2 e 100 caracteres.</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="inscricalMunicipal">Inscrição municipal</label>
          <input type="text" id="inscricalMunicipal" name="inscricalMunicipal" value={formData.inscricalMunicipal} onChange={handleChange} />
          {errors.inscricalMunicipal ? (
            <span style={{ color: 'red', fontSize: '10px' }}>{errors.inscricalMunicipal}</span>
          ) : (
            <span>A Inscrição Municipal deve ter entre 2 e 100 caracteres.</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="inscricalEstadual">Inscrição estadual</label>
          <input type="text" id="inscricalEstadual" name="inscricalEstadual" value={formData.inscricalEstadual} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <FormattedInput type="email" id="email" name="email" placeholder="Campo obrigatório" value={formData.email} onChange={handleChange} />
          {errors.email ? (
            <span style={{ color: 'red', fontSize: '10px' }}>{errors.email}</span>
          ) : (
            <span>Digite um endereço de e-mail válido.</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <FormattedInput type="telefone" id="telefone" name="telefone" placeholder="Campo obrigatório" value={formData.telefone} onChange={handleChange} />
          {errors.telefone ? (
            <span style={{ color: 'red', fontSize: '10px' }}>{errors.telefone}</span>
          ) : (
            <span>Digite um telefone válido.</span>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="cancel" onClick={onClose}>Cancelar</button>
          <button type="submit" className="save">Salvar</button>
        </div>
      </form>

      {notification && (
        <Notification
          title={notification.title}
          message={notification.message}
          secondaryMessage={notification.secondaryMessage}
          type={notification.type}
          icon={notification.icon}
          buttons={notification.buttons}
          onClose={handleNotificationClose}
        />
      )}
    </>
  );
};

export default FornecedorForm;
