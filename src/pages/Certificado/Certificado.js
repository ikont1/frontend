import React, { useState } from 'react';
import './Certificado.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { AlertTriangle, Eye, EyeOff, UploadCloud } from 'react-feather'; // Ícones do react-feather
import { CiCircleCheck } from 'react-icons/ci';
import Lottie from 'react-lottie';
import animationData from '../../lottieflow-scrolling-01-1-ffffff-easey.json';

const Certificado = () => {
  const [certificadoIncluido, setCertificadoIncluido] = useState(false); // Certificado presente ou não
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar ou esconder a senha
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null); // Controle do arquivo selecionado
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento
  const [dataCertificado, setDataCertificado] = useState(null); // Dados do certificado
  const [senha, setSenha] = useState(''); // Estado da senha

  // Função para alternar a visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Função para capturar o arquivo selecionado
  const handleFileChange = (e) => {
    setArquivoSelecionado(e.target.files[0]);
  };

  // Função para enviar o certificado
  const handleEnviarCertificado = () => {
    if (!arquivoSelecionado || !senha) {
      alert("Preencha todos os campos");
      return;
    }

    setIsLoading(true);

    // Simulação de envio de dados e sucesso após 3 segundos
    setTimeout(() => {
      setDataCertificado({
        nomeArquivo: arquivoSelecionado.name,
        dataVinculacao: new Date().toLocaleString(),
        dataVencimento: "05/04/2025",
        diasRestantes: 199,
      });
      setCertificadoIncluido(true);
      setIsLoading(false);
    }, 3000);
  };

  // Função para remover o certificado
  const handleRemoverCertificado = () => {
    setCertificadoIncluido(false);
    setArquivoSelecionado(null);
    setDataCertificado(null);
    setSenha('');
  };

  // Opções do Lottie
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className='container-certificado'>
          <h2>Certificado Digital</h2>

          <div className='content-certificado'>
            <div className='texto-certificado'>
              <h3>Vincule seu certificado digital A1 à conta Ikont1</h3>
              <p>Ele é essencial para manter sua empresa regularizada com os impostos e declarações</p>
            </div>

            <div className="upload-certificado">
              <div>
                {certificadoIncluido ? (
                  <div className='certificado-incluido'>
                    <h3>Certificado Digital A1</h3>
                    <p className='certificado-vencimento'>
                      <span className="vencimento-texto">Vence em</span> <span className="vencimento-data">{dataCertificado?.dataVencimento}</span> <span className="vencimento-dias">({dataCertificado?.diasRestantes} dias)</span>
                    </p>
                    <p className='certificado-data'>Você vinculou o certificado em {dataCertificado?.dataVinculacao}</p>

                    <div className='botoes-certificado'>
                      <button className='botao-alterar'>Alterar certificado</button>
                      <button className='botao-remover' onClick={handleRemoverCertificado}>Remover...</button>
                    </div>
                  </div>
                ) : (
                  <div className='certificado-upload'>
                    <h3>Informe o arquivo do Certificado A1</h3>

                    <div className="upload-field">
                      <label htmlFor="arquivo-certificado" className="upload-label">
                        <UploadCloud size={18} /> {arquivoSelecionado ? arquivoSelecionado.name : 'Escolha arquivo'}
                      </label>
                      <input
                        id="arquivo-certificado"
                        type="file"
                        accept=".pfx, .p12"
                        className="input-arquivo"
                        onChange={handleFileChange}
                      />
                      <p className="formatos-validos">Formatos válidos: .pfx, .p12</p>
                    </div>

                    <div className='senha-field'>
                      <label htmlFor="senha">Qual a senha?</label>
                      <div className="input-senha-container">
                        <input
                          id="senha"
                          type={showPassword ? "text" : "password"}
                          placeholder="Senha"
                          className="input-senha"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                        />
                        <button className="toggle-password" onClick={togglePasswordVisibility}>
                          {showPassword ? <EyeOff size={18} color='#01dd01' /> : <Eye size={18} color='#01dd01' />}
                        </button>
                      </div>
                    </div>

                    <div className='botoes-certificado'>
                      <button className='botao-enviar' onClick={handleEnviarCertificado} disabled={isLoading}>
                        {isLoading ? <Lottie options={defaultOptions} height={20} width={20} /> : 'Enviar Certificado A1'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {certificadoIncluido ? (
                <CiCircleCheck size={150} color="#01dd01" />
              ) : (
                <AlertTriangle size={150} color="rgb(249, 249, 68)" />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Certificado;
