import React, { useState } from 'react';
import './Conciliacao.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ArrowDown, Upload, ArrowLeft, ArrowRight } from 'react-feather';
import bancoLogos from '../../assets/imgs/bbLogo.png';
import axios from 'axios';

const Conciliacao = () => {
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar o loading durante o upload
  const [uploadStatus, setUploadStatus] = useState(""); // Estado para fornecer feedback ao usuário

  // Função para capturar o arquivo selecionado e iniciar o upload automaticamente
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    console.log("Arquivo selecionado:", file);

    if (!file) {
      alert('Por favor, selecione um arquivo');
      return;
    }

    setIsLoading(true);
    setUploadStatus("Enviando arquivo...");

    try {
      // Passo 1: Obter a URL assinada
      const signedData = await getSignedUrl();
      console.log("Dados retornados pela URL assinada:", signedData);

      // Passo 2: Fazer o upload do arquivo para o S3
      await uploadFileToS3(file, signedData);

      // Passo 3: Construir a URL do arquivo manualmente
      const fileKey = signedData.fields.key.replace(/\${filename}/, file.name);
      console.log("Chave do arquivo construída:", fileKey);

      await submitFileKey(fileKey);

      setUploadStatus("Arquivo enviado com sucesso!");
    } catch (error) {
      console.error('Erro durante o upload:', error);
      setUploadStatus("Erro ao enviar o arquivo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para solicitar a URL assinada
  async function getSignedUrl() {
    const token = localStorage.getItem('token'); // Recupera o token do localStorage
    console.log("Token recuperado:", token);
    try {
      const response = await axios.get('https://api.ikont1.com.br/upload/url', {
        headers: {
          Authorization: `Bearer ${token}`, // Inclui o token no cabeçalho Authorization
        },
      });
      console.log("Resposta da requisição para URL assinada:", response);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao obter a URL assinada:', error);
      throw error;
    }
  }

  // Função para fazer upload do arquivo para o S3
  async function uploadFileToS3(file, signedData) {
    const formData = new FormData();
    
    // Adiciona todos os campos necessários ao formData
    Object.keys(signedData.fields).forEach(key => {
      formData.append(key, signedData.fields[key]);
    });
    
    // Adiciona o arquivo OFX ao formData
    formData.append('file', file);

    console.log("Dados sendo enviados para o S3:");
    for (let pair of formData.entries()) {
      console.log(pair[0]+ ': ' + pair[1]);
    }
    console.log("URL de upload do S3:", signedData.url);

    try {
      const response = await axios.post(signedData.url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log("Resposta do upload para o S3:", response);

      // O S3 retorna 204 No Content quando o upload é bem-sucedido.
      if (response.status !== 204) {
        throw new Error("Erro: O upload para o S3 não foi bem-sucedido.");
      }
    } catch (error) {
      console.error('Erro ao fazer upload para o S3:', error);
      throw error;
    }
  }

  // Função para enviar a chave do arquivo ao backend
  async function submitFileKey(fileKey) {
    const token = localStorage.getItem('token');
    console.log("Token utilizado para enviar a chave ao backend:", token);
    console.log("Chave do arquivo a ser enviada:", fileKey);
    try {
      const response = await axios.post(`https://api.ikont1.com.br/conta-bancaria/6/extrato`, 
      { chaveArquivo: fileKey },
      {
        headers: {
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json', 
        },
      });
      console.log("Resposta do envio da chave ao backend:", response.data);
    } catch (error) {
      console.error('Erro ao enviar a chave do arquivo para o backend:', error);
      console.error("Detalhes da requisição:", {
        url: 'https://api.ikont1.com.br/conta-bancaria/6/extrato',
        chaveArquivo: fileKey,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      throw error;
    }
  }
  

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="container-conciliacao">
          <h2>Conciliação financeira</h2>

          <div className="conciliacao-section">
            <div className="conta-info">
              <div className="banco-logo-container">
                <img src={bancoLogos} alt="Banco Logo" className="banco-logo-conciliacao" />
              </div>
              <div className="banco-detalhes">
                <h3>Banco do Brasil</h3>
                <div className="conta-identificadores">
                  <span>000-1</span>
                  <span>23958965606</span>
                </div>
              </div>
              <div className="icon-dropdown">
                <p>Conta Corrente</p>
                <ArrowDown />
              </div>
            </div>

            <div className="importar-extrato">
              <label htmlFor="upload-file" className="importar-link">
                <Upload />
                <div>
                  <span>Importar extrato</span>
                  <p>selecione o arquivo .ofx</p>
                </div>
              </label>
              <input 
                type="file" 
                id="upload-file" 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
                accept=".ofx" // Restrição para aceitar apenas arquivos OFX
              />
            </div>
          </div>

          {/* Feedback visual */}
          {isLoading && (
            <div className="upload-status">
              <p style={{backgroundColor: 'red'}}>{uploadStatus}</p>
            </div>
          )}
        </div>

        <div className="container-lancamentos">
          <div className="lancamentos-importados">
            <h3>Lançamentos importados</h3>
            <div className="card-banco">
              <img src={bancoLogos} alt="Banco do Brasil" className="banco-logo" />
              <div className="banco-info">
                <p>Banco do Brasil</p>
                <span>000-1</span>
                <span>23958596606</span>
              </div>
            </div>
          </div>

          <div className="setas">
            <ArrowLeft className="seta-icon" />
            <ArrowRight className="seta-icon" />
          </div>

          <div className="lancamentos-cadastrar">
            <h3>Lançamentos a cadastrar</h3>
            <div className="card-sugestoes">
              <div className="icone-sugestoes"></div>
              <p>Sugestões de conciliação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conciliacao;
