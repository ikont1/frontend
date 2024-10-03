import React, { useState } from 'react';
import { useClientSupplier } from '../../context/ClientSupplierContext';
import './ClientesFornecedores.css';
import { ThumbsUp, AlertTriangle } from 'react-feather';
import Notification from '../../components/Notification/Notification';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';

const ClienteForm = ({ initialData = {}, onClose, fetchData }) => {
  const { addCliente, updateCliente } = useClientSupplier();

  const [formData, setFormData] = useState({
    cpfCnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    inscricalMunicipal: '',
    inscricalEstadual: '',
    telefone: '',
    celular: '',
    email: '',
    contato: '',
    endereco: {
      endereco: '',
      complemento: '',
      numero: '',
      bairro: '',
      uf: '',
      cidade: '',
      cep: '',
    },
    ...initialData
  });

  const [step, setStep] = useState(1); // Controla os passos do formulário
  const [notification, setNotification] = useState(null); // Controla as notificações
  const [errors, setErrors] = useState({}); // Controla os erros de validação

  const handleNotificationClose = () => {
    setNotification(null);
    onClose(); // Fecha o modal
  };

  const handleNextStep = () => {
    const validationErrors = validateStep1();
    if (Object.keys(validationErrors).length === 0) {
      setStep(step + 1);
    } else {
      setErrors(validationErrors);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.endereco) {
      setFormData({ ...formData, endereco: { ...formData.endereco, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: '' });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.nomeFantasia) newErrors.nomeFantasia = 'Nome é obrigatório';
    if (!formData.cpfCnpj) {
      newErrors.cpfCnpj = 'CNPJ/CPF é obrigatório';
    } else {
      const cleanValue = formData.cpfCnpj.replace(/\D/g, '');
      if (cleanValue.length !== 11 && cleanValue.length !== 14) {
        newErrors.cpfCnpj = 'Digite um CNPJ ou CPF válido';
      }
    }

    if (!formData.razaoSocial) newErrors.razaoSocial = 'Razão Social é obrigatória';
    if (!formData.telefone) newErrors.telefone = 'Telefone é obrigatório';
    if (!formData.celular) newErrors.celular = 'Celular é obrigatório';
    if (!formData.email) newErrors.email = 'E-mail é obrigatório';
    if (!formData.contato) newErrors.contato = 'Nome do Contato é obrigatório';
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.endereco.endereco) newErrors.endereco = 'Endereço é obrigatório';
    if (!formData.endereco.cep) newErrors.cep = 'CEP é obrigatório';
    if (!formData.endereco.numero) newErrors.numero = 'Número é obrigatório';
    if (!formData.endereco.bairro) newErrors.bairro = 'Bairro é obrigatório';
    if (!formData.endereco.uf) newErrors.uf = 'Estado é obrigatório';
    if (!formData.endereco.cidade) newErrors.cidade = 'Cidade é obrigatória';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrorsStep1 = validateStep1();
    const validationErrorsStep2 = validateStep2();
    const validationErrors = { ...validationErrorsStep1, ...validationErrorsStep2 };
  
    if (Object.keys(validationErrors).length === 0) {
      // Copiar o formData para um novo objeto
      const dataToSubmit = { ...formData };
  
      // Remover campos vazios
      if (!dataToSubmit.inscricalMunicipal) {
        delete dataToSubmit.inscricalMunicipal;
      }
      if (!dataToSubmit.inscricalEstadual) {
        delete dataToSubmit.inscricalEstadual;
      }
  
      // Remover campos vazios do endereço
      const cleanedEndereco = { ...dataToSubmit.endereco };
      Object.keys(cleanedEndereco).forEach(key => {
        if (cleanedEndereco[key] === '') {
          delete cleanedEndereco[key];
        }
      });
      dataToSubmit.endereco = cleanedEndereco;
   
      try {
        if (initialData.id) {
          await updateCliente(initialData.id, dataToSubmit);
          setNotification({
            title: 'Tudo certo!',
            message: 'As informações do Cliente foram atualizadas.',
            type: 'success',
            icon: ThumbsUp,
            buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
          });
        } else {
          await addCliente(dataToSubmit);
          setNotification({
            title: 'Cliente cadastrado com sucesso!',
            message: 'Oba! Seu cadastro foi bem-sucedido!',
            type: 'success',
            icon: ThumbsUp,
            buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
          });
        }
        fetchData();
      } catch (error) {
        setNotification({
          title: 'Erro ao salvar Cliente',
          message: 'Houve um problema ao salvar as informações do Cliente.',
          type: 'error',
          icon: AlertTriangle,
          buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
        });
      }
    } else {
      setErrors(validationErrors);
    }
  };
  

  return (
    <>
      <form onSubmit={handleSubmit}>
        <span>{initialData.nomeFantasia}</span>

        <div className="step-indicator">
          <div className={`steps ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">01</div>
            <div className="step-title">Dados do cliente</div>
          </div>
          <div className='line-indicator'></div>
          <div className={`steps ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">02</div>
            <div className="step-title">Endereço</div>
          </div>
        </div>

        {step === 1 && (
          <div className='step'>
            <div className="form-group-static">
              <p>Onde o cliente está?</p>
              <div className="static-info">
                <div className="circle"></div>
                <span>Brasil</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nomeFantasia">Nome Fantasia</label>
              <input type="text" id="nomeFantasia" name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} required />
              {errors.nomeFantasia ? (
                <span style={{ color: 'red', fontSize: '10px' }}>{errors.nomeFantasia}</span>
              ) : (
                <span>O nome da empresa deve ter entre 2 e 100 caracteres.</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cpfCnpj">CNPJ/CPF</label>
              <FormattedInput type="cpfCnpj" id="cpfCnpj" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} required />
              {errors.cpfCnpj ? (
                <span style={{ color: 'red', fontSize: '10px' }}>{errors.cpfCnpj}</span>
              ) : (
                <span>Digite um CNPJ ou CPF válido.</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="razaoSocial">Razão Social</label>
              <input type="text" id="razaoSocial" name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} required />
              {errors.razaoSocial ? (
                <span style={{ color: 'red', fontSize: '10px' }}>{errors.razaoSocial}</span>
              ) : (
                <span>A razão Social deve ter entre 2 e 100 caracteres.</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="inscricalMunicipal">Inscrição Municipal</label>
              <input type="text" id="inscricalMunicipal" name="inscricalMunicipal" value={formData.inscricalMunicipal} onChange={handleChange} />
            </div>

            <div className='form-group'>
              <label htmlFor="inscricalEstadual">Inscrição Estadual</label>
              <input type="text" id="inscricalEstadual" name="inscricalEstadual" value={formData.inscricalEstadual} onChange={handleChange} />
            </div>

            <div className="form-group-modal">
              <div className="form-group">
                <label htmlFor="telefone">Telefone (obrigatório)</label>
                <FormattedInput type="telefone" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} required />
                {errors.telefone ? (
                  <span style={{ color: 'red', fontSize: '10px' }}>{errors.telefone}</span>
                ) : (
                  <span>Digite um telefone válido.</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="celular">Celular (obrigatório)</label>
                <FormattedInput type="telefone" id="celular" name="celular" value={formData.celular} onChange={handleChange} required />
                {errors.celular ? (
                  <span style={{ color: 'red', fontSize: '10px' }}>{errors.celular}</span>
                ) : (
                  <span>Digite um celular válido.</span>
                )}
              </div>
            </div>

            <div className="form-group-modal">
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <FormattedInput type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                {errors.email ? (
                  <span style={{ color: 'red', fontSize: '10px' }}>{errors.email}</span>
                ) : (
                  <span>Digite um endereço de e-mail válido.</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="contato">Nome do Contato</label>
                <input type="text" id="contato" name="contato" value={formData.contato} onChange={handleChange} required />
                {errors.contato ? (
                  <span style={{ color: 'red', fontSize: '10px' }}>{errors.contato}</span>
                ) : (
                  <span>O Nome para contato deve ter entre 2 e 100 caracteres.</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleNextStep} className='btn-sttep-1'>Próximo</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <div className='form-group'>
              <label htmlFor="endereco">Endereço (obrigatório)</label>
              <input type="text" id="endereco" name="endereco" value={formData.endereco.endereco} onChange={handleChange} required />
              {errors.endereco ? (
                <span style={{ color: 'red', fontSize: '10px' }}>{errors.endereco}</span>
              ) : (
                <span>O endereço deve ter até 200 caracteres.</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="complemento">Complemento (obrigatório)</label>
              <input type="text" id="complemento" name="complemento" value={formData.endereco.complemento} onChange={handleChange} required/>
              {errors.complemento ? (
                <span style={{ color: 'red', fontSize: '10px' }}>{errors.complemento}</span>
              ) : (
                <span>O Complemento deve ter até 60 caracteres.</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="cep">CEP (obrigatório)</label>
              <FormattedInput type="cep" id="cep" name="cep" value={formData.endereco.cep} onChange={handleChange} required />
              {errors.cep ? (
                <span style={{ color: 'red', fontSize: '10px' }}>{errors.cep}</span>
              ) : (
                <span>Esse item é obrigatório.</span>
              )}
            </div>
            <div className="form-group-modal">
              <div className="form-group">
                <label htmlFor="numero">Número (obrigatório)</label>
                <input type="text" id="numero" name="numero" value={formData.endereco.numero} onChange={handleChange} required />
                {errors.numero ? (
                  <span style={{ color: 'red', fontSize: '10px' }}>{errors.numero}</span>
                ) : (
                  <span>O Número deve ter até 10 caracteres.</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="bairro">Bairro (obrigatório)</label>
                <input type="text" id="bairro" name="bairro" value={formData.endereco.bairro} onChange={handleChange} required />
                {errors.bairro ? (
                  <span style={{ color: 'red', fontSize: '10px' }}>{errors.bairro}</span>
                ) : (
                  <span>O Bairro deve ter até 50 caracteres.</span>
                )}
              </div>
            </div>
            <div className="form-group-modal">
              <div className="form-group">
                <label htmlFor="uf">Estado (obrigatório)</label>
                <select type="text" id="uf" name="uf" value={formData.endereco.uf} onChange={handleChange} required>
                  <option value="">Selecione um Estado</option>
                  <option value="PI">PI</option>
                  <option value="SP">SP</option>
                  <option value="GO">GO</option>
                </select>
                {errors.estado && <span style={{ color: 'red', fontSize: '10px' }}>{errors.estado}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="cidade">Cidade (obrigatório)</label>
                <input type="text" id="cidade" name="cidade" value={formData.endereco.cidade} onChange={handleChange} required />
                {errors.cidade && <span style={{ color: 'red', fontSize: '10px' }}>{errors.cidade}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel" onClick={handlePrevStep}>Voltar</button>
              <button type="submit" className="save">Salvar</button>
            </div>
          </div>
        )}
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

export default ClienteForm;
