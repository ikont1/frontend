import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Carteira.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { BiDollar } from 'react-icons/bi';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import { useWallet } from '../../context/WalletContext';
import { useAccount } from '../../context/AccountContext';

const CadastroContaBancaria = () => {
  const { cadastrarConta } = useWallet();
  const { listarContas } = useAccount();

  const [nameConta, setNameConta] = useState();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tipo: '',
    codigoBanco: '',
    nomeConta: '',
    agencia: '',
    numeroConta: '',
    contaDV: '',
    saldoInicial: '',
    dataSaldoInicial: '',
    contaPrincipal: false,
    chavePix: '',
    codigoIban: '',
    codigoSwift: ''
  });

  const bancoLogos = {
    '001': require('../../assets/imgs/bbLogo.png'),
    '237': require('../../assets/imgs/bradescologo.png'),
    '341': require('../../assets/imgs/itaulogo.png'),
    '260': require('../../assets/imgs/nubanklogo.png'),
    '104': require('../../assets/imgs/caixalogo.png'),
    '403': require('../../assets/imgs/coraLogo.png'),
    '077': require('../../assets/imgs/interLogo.png'),
  };

  // Usar useRef para evitar loop
  const listarContasRef = useRef(listarContas);

  // Buscar nome da conta do usuario
  useEffect(() => {
    const fetchNameConta = async () => {
      try {
        const nomeConta = await listarContasRef.current();
        setNameConta(nomeConta.data.conta.razaoSocial);
      } catch (error) {
        console.log('Erro ao buscar nome da conta', error);
      }
    };

    fetchNameConta();
  }, []);

  // Validação para checar os campos obrigatórios na segunda etapa
  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.codigoBanco) newErrors.codigoBanco = 'Campo obrigatório';
    if (!formData.nomeConta) newErrors.nomeConta = 'Campo obrigatório';
    if (!formData.agencia) newErrors.agencia = 'Campo obrigatório';
    if (!formData.numeroConta) newErrors.numeroConta = 'Campo obrigatório';
    if (!formData.contaDV) newErrors.contaDV = 'Campo obrigatório';
    if (!formData.saldoInicial) newErrors.saldoInicial = 'Campo obrigatório';
    if (!formData.dataSaldoInicial) newErrors.dataSaldoInicial = 'Campo obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (step === 2 && !validateStep2()) {
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Remover campos opcionais se estiverem vazios
      const dadosFiltrados = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      );

      try {
        await cadastrarConta(dadosFiltrados);
        navigate('/carteira');
      } catch (error) {
        console.error('Erro ao cadastrar conta:', error);
      }
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/carteira');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />

        <h4>Criar conta</h4>
        <div className="cadastro-conta-container">
          <div className="step-content">

            {step === 1 && (
              <div className="step1">
                <div className='steps-header'>
                  <h2>Vamos lá, {nameConta}</h2>
                  <p>Criar uma nova conta para a  {nameConta}</p>
                </div>

                <div className="step-indicator2">
                  <div className={`step ${step >= 1 ? 'active' : ''}`}>
                    <span>01</span> Conta
                  </div>
                  <div className={`step ${step >= 2 ? 'active' : ''}`}>
                    <span>02</span> Cadastro
                  </div>
                  <div className={`step ${step >= 3 ? 'active' : ''}`}>
                    <span>03</span> Revisar
                  </div>
                  <div className={`step ${step >= 4 ? 'active' : ''}`}>
                    <span>04</span> Concluído
                  </div>
                </div>

                <h3 style={{ textAlign: 'center' }}>Selecione o tipo da conta</h3>

                <div className="account-types">
                  <div
                    className={`account-type ${formData.tipo === 'contaCorrente' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, tipo: 'contaCorrente' })}
                  >
                    <BiDollar className='icon' />
                    Conta corrente
                  </div>
                  <div
                    className={`account-type ${formData.tipo === 'poupanca' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, tipo: 'poupanca' })}
                  >
                    <BiDollar className='icon' />
                    Poupança
                  </div>
                  <div
                    className={`account-type ${formData.tipo === 'meiosDePagamento' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, tipo: 'meiosDePagamento' })}
                  >
                    <BiDollar className='icon' />
                    Contas de pagamento
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step2">
                <div className='steps-header'>
                  <h2>Dados da conta da {nameConta}</h2>
                </div>

                <div className="step-indicator2">
                  <div className={`step ${step >= 1 ? 'active' : ''}`}>
                    <span>01</span> Conta
                  </div>
                  <div className={`step ${step >= 2 ? 'active' : ''}`}>
                    <span>02</span> Cadastro
                  </div>
                  <div className={`step ${step >= 3 ? 'active' : ''}`}>
                    <span>03</span> Revisar
                  </div>
                  <div className={`step ${step >= 4 ? 'active' : ''}`}>
                    <span>04</span> Concluído
                  </div>
                </div>

                <form>
                  <div className="form-group">
                    <label>Instituição financeira</label>
                    <select name="codigoBanco" value={formData.codigoBanco} onChange={handleChange} required>
                      <option value="">Selecione</option>
                      <option value="001">Banco do Brasil</option>
                      <option value="237">Bradesco</option>
                      <option value="341">Itaú</option>
                      <option value="260">Nubank</option>
                      <option value="403">Cora SCD</option>
                      <option value="104">Caixa Econômica</option>
                      <option value="077">Inter</option>
                    </select>
                    {errors.codigoBanco && <span className="error">{errors.codigoBanco}</span>}
                  </div>
                  <div className="form-group">
                    <label>Nome da conta</label>
                    <input type="text" name="nomeConta" value={formData.nomeConta} onChange={handleChange} required />
                    {errors.nomeConta && <span className="error">{errors.nomeConta}</span>}
                  </div>

                  <div className='form-group-agencia-conta'>
                    <div className="form-group">
                      <label>Agência</label>
                      <input type="text" name="agencia" value={formData.agencia} onChange={handleChange} required />
                      {errors.agencia && <span className="error">{errors.agencia}</span>}
                    </div>
                    <div className="form-group">
                      <label>Conta</label>
                      <input type="text" name="numeroConta" value={formData.numeroConta} onChange={handleChange} required />
                      {errors.numeroConta && <span className="error">{errors.numeroConta}</span>}
                    </div>
                    <div className="form-group input-dv">
                      <label>Dígito</label>
                      <input type="text" name="contaDV" value={formData.contaDV} onChange={handleChange} required />
                      {errors.contaDV && <span className="error">{errors.contaDV}</span>}
                    </div>
                  </div>

                  <div className="form-group form-group-cifrao">
                    <label htmlFor="valor">Saldo da conta</label>
                    <div className='div-sifrao'>
                      <span>R$</span>
                      <FormattedInput type="valor" name="saldoInicial" value={formData.saldoInicial} onChange={handleChange} required />
                    </div>
                    {errors.saldoInicial && <span className="error">{errors.saldoInicial}</span>}
                  </div>
                  <div className="form-group">
                    <label>Data do saldo</label>
                    <input type="date" name="dataSaldoInicial" value={formData.dataSaldoInicial} onChange={handleChange} required />
                    {errors.dataSaldoInicial && <span className="error">{errors.dataSaldoInicial}</span>}
                  </div>
                  <div className="form-group group-checkbox">
                    <label>
                      <input type="checkbox" name="contaPrincipal" checked={formData.contaPrincipal} onChange={handleChange} />
                      Esta conta é a principal?
                    </label>
                  </div>
                  <div className="form-group optional-data">
                    <label>Chave Pix (opcional)</label>
                    <input type="text" name="chavePix" value={formData.chavePix} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Código IBAN (opcional)</label>
                    <input type="text" name="codigoIban" value={formData.codigoIban} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Código SWIFT (opcional)</label>
                    <input type="text" name="codigoSwift" value={formData.codigoSwift} onChange={handleChange} />
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="step3">
                <div className='steps-header'>
                  <h2>Estamos na reta final</h2>
                  <p>Integração bancária manual</p>
                </div>

                <div className="step-indicator2">
                  <div className={`step ${step >= 1 ? 'active' : ''}`}>
                    <span>01</span> Conta
                  </div>
                  <div className={`step ${step >= 2 ? 'active' : ''}`}>
                    <span>02</span> Cadastro
                  </div>
                  <div className={`step ${step >= 3 ? 'active' : ''}`}>
                    <span>03</span> Revisar
                  </div>
                  <div className={`step ${step >= 4 ? 'active' : ''}`}>
                    <span>04</span> Concluído
                  </div>
                </div>

                <div className="card-conta">
                  <div className="card-header">
                    <img src={bancoLogos[formData.codigoBanco] || bancoLogos['default']} alt="Banco Logo" className="banco-logo" />
                    <div className="banco-info">
                      <h3>{formData.nomeConta}</h3>
                      <div className="banco-dados">
                        <span className="agencia">{formData.agencia}</span>
                        <span className="conta">{formData.numeroConta} - {formData.contaDV}</span>
                      </div>
                    </div>
                    <div className='saldo'>
                      <span className="saldo-label">R${formData.saldoInicial}</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="saldo-total">
                      <span>Saldo total</span>
                      <span className='span-total'>R${formData.saldoInicial}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="step4">
                <div className='steps-header'>
                  <h2>Estamos na reta final</h2>
                  <p>Integração bancária manual</p>
                </div>

                <div className="step-indicator2">
                  <div className={`step ${step >= 1 ? 'active' : ''}`}>
                    <span>01</span> Conta
                  </div>
                  <div className={`step ${step >= 2 ? 'active' : ''}`}>
                    <span>02</span> Cadastro
                  </div>
                  <div className={`step ${step >= 3 ? 'active' : ''}`}>
                    <span>03</span> Revisar
                  </div>
                  <div className={`step ${step >= 4 ? 'active' : ''}`}>
                    <span>04</span> Concluído
                  </div>
                </div>
                <h2>Operação realizada com sucesso!</h2>
              </div>
            )}

          </div>

          <div className="buttons">
            <button className="back-button" onClick={handlePreviousStep}>{step > 1 ? '← Voltar' : 'Cancelar'}</button>
            <button className="next-button" onClick={handleNextStep} disabled={step === 1 && !formData.tipo}>{step < 4 ? 'Próximo' : 'OK'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroContaBancaria;
