import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Assinatura.css';
import { useAssinatura } from '../../context/AssinaturaContext';
import { useLocation } from 'react-router-dom';
import logo from '../../assets/imgs/logosvg.svg';
import imgLogin from '../../assets/imgs/img-login.png';
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import Lottie from 'react-lottie';
import animationData from '../../lottieflow-scrolling-01-1-ffffff-easey.json';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';

const Assinatura = () => {
  const { criarAssinatura } = useAssinatura();
  const location = useLocation();
  const navigate = useNavigate();


  // Garante que o token nunca seja null
  const token = new URLSearchParams(location.search).get('token') || '';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    endereco: '',
    complemento: '',
    bairro: '',
    numero: '',
    cep: '',
    cidade: '',
    uf: '',
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
    ciclo: 'MONTHLY' // Valor padrão do ciclo é 'MONTHLY'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});


  // Opções do Lottie
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  // Função para validar os campos do endereço (primeiro passo)
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.endereco) newErrors.endereco = 'Campo obrigatório';
    if (!formData.bairro) newErrors.bairro = 'Campo obrigatório';
    if (!formData.numero) newErrors.numero = 'Campo obrigatório';
    if (!formData.cep) newErrors.cep = 'Campo obrigatório';
    if (!formData.cidade) newErrors.cidade = 'Campo obrigatório';
    if (!formData.uf) newErrors.uf = 'Campo obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para validar os campos do cartão de crédito (segundo passo)
  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.holderName) newErrors.holderName = 'Campo obrigatório';
    if (!formData.number) newErrors.number = 'Campo obrigatório';
    if (!formData.expiryMonth) newErrors.expiryMonth = 'Campo obrigatório';
    if (!formData.expiryYear) newErrors.expiryYear = 'Campo obrigatório';
    if (!formData.ccv || formData.ccv.length !== 3) newErrors.ccv = 'CCV deve ter 3 dígitos';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formata o número do cartão de crédito para inserir espaços a cada 4 dígitos
  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim()
      .slice(0, 19);
  };

  // Atualiza o estado para o número do cartão de crédito
  const handleCardNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: formatCardNumber(value)
    });
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  // Lida com a mudança de valor dos inputs em geral
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'expiryMonth' && value.length > 2) return;
    if (name === 'expiryYear' && value.length > 4) return;

    // Limita o CCV a 3 caracteres
    if (name === 'ccv' && value.length > 3) return;

    setFormData({
      ...formData,
      [name]: value
    });
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  // Lida com a mudança de valor do select de ciclo
  const handleCicloChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      ciclo: value
    });
  };

  // Avança para o próximo passo do formulário
  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) {
      return;
    }
    setStep(step + 1);
  };

  // Volta para o Step 1 (endereço)
  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  // Envia os dados da assinatura
  const handleSubmit = async () => {
    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);


    setTimeout(async () => {
      const enderecoPayload = {
        endereco: formData.endereco,
        bairro: formData.bairro,
        numero: formData.numero,
        cep: formData.cep,
        cidade: formData.cidade,
        uf: formData.uf
      };

      if (formData.complemento && formData.complemento.trim() !== '') {
        enderecoPayload.complemento = formData.complemento;
      }

      const payload = {
        token: token,
        ciclo: formData.ciclo,
        cartaoCredito: {
          holderName: formData.holderName,
          number: formData.number.replace(/\s/g, ''),
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          ccv: formData.ccv
        },
        endereco: enderecoPayload
      };

      try {
        await criarAssinatura(payload);
        setIsLoading(false);
        navigate('/login');
      } catch (error) {
        setIsLoading(false);
      }
    }, 3000);
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src={imgLogin} alt="Login" />
      </div>

      <div className="login-form">
        <img src={logo} alt="Logo" className="logo" />

        <h2>Complete os dados para assinatura</h2>
        <br></br>

        {/* Card de checkout */}
        <div className="assinatura-content">
          {step === 1 && (
            <div className="step1">
              <h4>Endereço</h4>

              <input
                type="text"
                name="endereco"
                placeholder="Endereço"
                value={formData.endereco}
                onChange={handleChange}
              />
              {errors.endereco && <span className="error">{errors.endereco}</span>}

              <input
                type="text"
                name="complemento"
                placeholder="Complemento"
                value={formData.complemento}
                onChange={handleChange}
              />
              <div className='input-duplo'>
                <div>
                  <input
                    type="text"
                    name="bairro"
                    placeholder="Bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                  />
                  {errors.bairro && <span className="error">{errors.bairro}</span>}
                </div>

                <div>
                  <input
                    type="text"
                    name="numero"
                    placeholder="Número"
                    value={formData.numero}
                    onChange={handleChange}
                  />
                  {errors.numero && <span className="error">{errors.numero}</span>}
                </div>
              </div>

              <div className='input-duplo'>
                <div>
                  <FormattedInput
                    type="cep"
                    name="cep"
                    placeholder="CEP"
                    value={formData.cep}
                    onChange={handleChange}
                  />
                  {errors.cep && <span className="error">{errors.cep}</span>}
                </div>

                <div>
                  <input
                    type="text"
                    name="cidade"
                    placeholder="Cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                  />
                  {errors.cidade && <span className="error">{errors.cidade}</span>}
                </div>
              </div>
              <div style={{ width: '100px' }}>
                <input
                  type="text"
                  name="uf"
                  placeholder="UF"
                  value={formData.uf}
                  onChange={handleChange}
                />
                {errors.uf && <span className="error">{errors.uf}</span>}
              </div>
              <br></br>
              <button onClick={handleNextStep}>Próximo</button>
            </div>
          )}

          {step === 2 && (
            <div className="step2">
              <div className="cartao-preview">
                {/* Exibição dinâmica dos dados do cartão */}
                <div className="cartao">
                  <p>{formData.holderName || 'Nome do Titular'}</p>
                  <p>{formData.number || '**** **** **** ****'}</p>
                  <p>{formData.expiryMonth}/{formData.expiryYear}</p>
                </div>
              </div>

              <h5>Dados do Cartão</h5>

              <input
                style={{ textTransform: 'uppercase' }}
                type="text"
                name="holderName"
                placeholder="Nome no Cartão"
                value={formData.holderName}
                onChange={handleChange}
              />
              {errors.holderName && <span className="error">{errors.holderName}</span>}

              <input
                type="text"
                name="number"
                placeholder="Número do Cartão"
                value={formData.number}
                onChange={handleCardNumberChange} // Formata o número
              />
              {errors.number && <span className="error">{errors.number}</span>}

              <div className='input-duplo'>
                <div>
                  <input
                    type="text"
                    name="expiryMonth"
                    placeholder="Mês de Expiração"
                    value={formData.expiryMonth}
                    onChange={handleChange} // Limita a 2 caracteres
                  />
                  {errors.expiryMonth && <span className="error">{errors.expiryMonth}</span>}
                </div>

                <div>
                  <input
                    type="text"
                    name="expiryYear"
                    placeholder="Ano de Expiração"
                    value={formData.expiryYear}
                    onChange={handleChange} // Limita a 4 caracteres
                  />
                  {errors.expiryYear && <span className="error">{errors.expiryYear}</span>}
                </div>

                <div>
                  <input
                    type="text"
                    name="ccv"
                    placeholder="CCV"
                    value={formData.ccv}
                    onChange={handleChange} // Limita a 3 caracteres
                  />
                  {errors.ccv && <span className="error">{errors.ccv}</span>}
                </div>
              </div>

              {/* Select para escolher o ciclo (mensal ou anual) */}
              <div>
                <label htmlFor="ciclo">Escolha o Ciclo</label>
                <select
                  id="ciclo"
                  name="ciclo"
                  value={formData.ciclo}
                  onChange={handleCicloChange} // Atualiza o ciclo selecionado
                >
                  <option value="MONTHLY">Mensal</option>
                  <option value="YEARLY">Anual</option>
                </select>
              </div>

              <div className='container-btn-assinar'>
                <button onClick={handlePreviousStep}>Voltar</button>

                <button
                  className='btn-assinar'
                  onClick={handleSubmit}
                  disabled={isLoading} // Desativa o botão durante o carregamento
                >
                  {isLoading ? (
                    <Lottie options={defaultOptions} height={20} width={20} />
                  ) : (
                    'Finalizar Assinatura'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Social media links */}
        <div style={{ marginTop: '20px' }} className="div-botton">
          <div className="social-media">
            <a href='https://www.instagram.com/ikont1/' target="_blank" rel="noopener noreferrer">
              <FaInstagram aria-hidden="true" className="i-sociais" />
            </a>
            <a href='https://api.whatsapp.com/send/?phone=5586994530553&text&type=phone_number&app_absent=0' target="_blank" rel="noopener noreferrer">
              <FaWhatsapp aria-hidden="true" className="i-sociais" />
            </a>
            <a href='https://www.facebook.com/profile.php?id=61560873020631' target="_blank" rel="noopener noreferrer">
              <FaFacebook aria-hidden="true" className="i-sociais" />
            </a>
            <a href='https://www.linkedin.com/company/ikont1' target="_blank" rel="noopener noreferrer">
              <FaLinkedin aria-hidden="true" className="i-sociais" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assinatura;
