import React, { useState, useEffect } from 'react';
import './Certificado.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { AlertTriangle, Eye, EyeOff, UploadCloud, ThumbsUp } from 'react-feather';
import { CiCircleCheck } from 'react-icons/ci';
import Lottie from 'react-lottie';
import animationData from '../../lottieflow-scrolling-01-1-ffffff-easey.json';
import Notification from '../../components/Notification/Notification';
import ConfirmationModal from '../../components/Modal/confirmationModal';
import axios from 'axios';
import api from '../../services/api';

const Certificado = () => {
  const [certificadoIncluido, setCertificadoIncluido] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [dataCertificado, setDataCertificado] = useState(null);
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalAlterar, setShowModalAlterar] = useState(false);

  const handleNotificationClose = () => {
    setNotification(null);
  };

  // Função para alternar a visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Função para capturar o arquivo selecionado
  const handleFileChange = (e) => {
    setArquivoSelecionado(e.target.files[0]);
  };

  // Função para solicitar a URL assinada para o upload do certificado
  const getSignedUrl = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('https://api.ikont1.com.br/upload/url', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao obter a URL assinada:', error);
      throw error;
    }
  };

  // Função para fazer upload do arquivo para o S3
  const uploadFileToS3 = async (file, signedData) => {
    const formData = new FormData();
    Object.keys(signedData.fields).forEach((key) => {
      formData.append(key, signedData.fields[key]);
    });
    formData.append('file', file);

    try {
      const response = await axios.post(signedData.url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status !== 204) {
        throw new Error('Erro: O upload para o S3 não foi bem-sucedido.');
      }
    } catch (error) {
      console.error('Erro ao fazer upload para o S3:', error);
      throw error;
    }
  };

  // Função para enviar a chave do arquivo ao backend
  const submitFileKey = async (fileKey) => {
    const token = localStorage.getItem('token');
    try {
      await api.post('/certificado', {
        nome: 'Certificado Digital A1',
        chaveArquivo: fileKey,
        senha: senha,
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setNotification({
        title: 'Tudo certo!',
        message: 'Cerficado cadastrado com sucesso',
        type: 'success2',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      listarCertificado();
    } catch (error) {
      console.error('Erro ao enviar a chave do arquivo para o backend:', error.response?.data || error.message);
      setNotification({
        title: 'Erro',
        message: error.response?.data?.message || 'Erro ao incluir certificado.',
        secondaryMessage: error.response?.data?.error || 'Verifique os dados e tente novamente',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      throw error;
    }
  };

  // Função para enviar o certificado
  const handleEnviarCertificado = async () => {
    if (!arquivoSelecionado || !senha) {
      alert('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const signedData = await getSignedUrl();
      await uploadFileToS3(arquivoSelecionado, signedData);
      const fileKey = signedData.fields.key.replace(/\${filename}/, arquivoSelecionado.name);
      await submitFileKey(fileKey);
      setCertificadoIncluido(true);
    } catch (error) {
      console.error('Erro ao cadastrar certificado', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar o certificado existente (GET)
  const listarCertificado = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await api.get('/certificado', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const certificado = response.data.data;
      setCertificadoIncluido(true);
      setDataCertificado({
        nome: certificado.nome,
        criadoEm: new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(certificado.criadoEm)), // Formato dd/mm/aa, 21:40h

        fimValidade: new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }).format(new Date(certificado.fimValidade)), // Formato dd/mm/aa

        diasRestantes: Math.floor(
          (new Date(certificado.fimValidade) - new Date()) / (1000 * 60 * 60 * 24)
        ),
      });
    } catch (error) {
      if (error.response?.status === 404) {
        setCertificadoIncluido(false);
      } else {
        console.error('Erro ao buscar certificado', error);
      }
    }
  };

  // Função para remover o certificado existente (DELETE)
  const handleRemoverCertificado = async () => {
    const token = localStorage.getItem('token');
    try {
      await api.delete('/certificado', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCertificadoIncluido(false);
      setArquivoSelecionado(null);
      setDataCertificado(null);
      setSenha('');
      setNotification({
        title: 'Tudo certo!',
        message: 'Cerficado Excluido com sucesso',
        type: 'success2',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } catch (error) {
      console.error('Erro ao remover certificado', error);
    } finally {
      closeConfirmationModal();
      closeConfirmationModalAlterar();
    }
  };

  // Carregar o certificado ao montar o componente
  useEffect(() => {
    listarCertificado();
  }, []);

  // Função para abrir o modal de confirmação
  const openConfirmationModal = () => {
    setShowModal(true);
  };

  // Função para abrir o modal de alterar certificado
  const openConfirmationModalAlterar = () => {
    setShowModalAlterar(true);
  };

  // Função para fechar o modal de confirmação
  const closeConfirmationModal = () => {
    setShowModal(false);
  };
  // Função para fechar o modal de confirmação
  const closeConfirmationModalAlterar = () => {
    setShowModalAlterar(false);
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

        <div className="container-certificado">
          <h2>Certificado Digital</h2>

          <div className="content-certificado">
            {certificadoIncluido ? (
              <div className="texto-certificado">
                <h3>O certificado digital A1 da sua empresa está vinculada à conta Ikont1</h3>
                <p>Ele é essencial para manter sua empresa regularizada com os impostos e declarações</p>
              </div>
            ) : (
              <div className="texto-certificado">
                <h3>Vincule seu certificado digital A1 à conta Ikont1</h3>
                <p>Ele é essencial para manter sua empresa regularizada com os impostos e declarações</p>
              </div>
            )}

            <div className="upload-certificado">
              <div>
                {certificadoIncluido ? (
                  <div className="certificado-incluido">
                    <h3>{dataCertificado?.nome}</h3>
                    <p className="certificado-vencimento">
                      <span className="vencimento-texto">Vence em</span>{' '}
                      <span className="vencimento-data">{dataCertificado?.fimValidade}</span>{' '}
                      <span className="vencimento-dias">
                        ({dataCertificado?.diasRestantes} dias)
                      </span>
                    </p>
                    <p className="certificado-data">
                      Você vinculou o certificado em {dataCertificado?.criadoEm}h
                    </p>

                    <div className="botoes-certificado">
                      <button className="botao-alterar" onClick={openConfirmationModalAlterar}>Alterar certificado</button>
                      <button className="botao-remover" onClick={openConfirmationModal}> Remover... </button>
                    </div>
                  </div>
                ) : (
                  <div className="certificado-upload">
                    <h3>Informe o arquivo do Certificado A1</h3>

                    <div className="upload-field">
                      <label htmlFor="arquivo-certificado" className="upload-label">
                        <UploadCloud size={18} />{' '}
                        {arquivoSelecionado ? arquivoSelecionado.name : 'Escolha arquivo'}
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

                    <div className="senha-field">
                      <label htmlFor="senha">Qual a senha?</label>
                      <div className="input-senha-container">
                        <input
                          id="senha"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Senha"
                          className="input-senha"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                        />
                        <button className="toggle-password" onClick={togglePasswordVisibility}>
                          {showPassword ? <EyeOff size={18} color="#01dd01" /> : <Eye size={18} color="#01dd01" />}
                        </button>
                      </div>
                    </div>

                    <div className="botoes-certificado">
                      <button className="botao-enviar" onClick={handleEnviarCertificado} disabled={loading}>
                        {loading ? <Lottie options={defaultOptions} height={20} width={20} /> : 'Enviar Certificado A1'}
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

      {notification && (
        <Notification
          title={notification.title}
          message={notification.message}
          secondaryMessage={notification.secondaryMessage}
          type={notification.type}
          buttons={notification.buttons}
          icon={notification.icon}
          onClose={handleNotificationClose}
        />
      )}

      {showModal && (
        <ConfirmationModal
          title="Remover Certificado"
          message="Você tem certeza que deseja remover o certificado?"
          secondaryMessage="Esta ação não pode ser desfeita."
          onConfirm={handleRemoverCertificado}
          onCancel={closeConfirmationModal}
        />
      )}

      {showModalAlterar && (
        <ConfirmationModal
          title="Alterar certificado"
          message="Você tem certeza que deseja alterar Certificado?"
          secondaryMessage="O certificado atual será excluído"
          onConfirm={handleRemoverCertificado}
          onCancel={closeConfirmationModalAlterar}
        />
      )}
    </div>
  );
};

export default Certificado;
