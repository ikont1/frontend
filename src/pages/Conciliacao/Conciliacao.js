import React, { useState, useEffect } from 'react';
import './Conciliacao.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ArrowDown, Upload, ArrowLeft, ArrowRight, AlertTriangle, ThumbsUp } from 'react-feather';
import axios from 'axios';
import { useWallet } from '../../context/WalletContext';
import { useConciliacao } from '../../context/ConciliacaoContext';
import { useFinance } from '../../context/FinanceContext';
import { useClientSupplier } from '../../context/ClientSupplierContext';
import ConfirmationModal from '../../components/Modal/confirmationModal';
import Modal from '../../components/Modal/Modal';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import Notification from '../../components/Notification/Notification';



const Conciliacao = () => {
  const { listarContas, listarExtrato } = useWallet();
  const { desfazerConciliacao, criarConciliacao, aceitarConciliacao, recusarConciliacao } = useConciliacao();
  const { fetchContasAReceber, fetchContasAPagar, addContaAPagar, addContaAReceber, contasAPagar, contasAReceber, updateContaAPagar, updateContaAReceber, fetchCategorias, categorias, categoriasAReceber, fetchCategoriasAReceber } = useFinance();
  const { fetchClientes, clientes, fetchFornecedores, fornecedores } = useClientSupplier();

  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [contaPrincipal, setContaPrincipal] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [selectedTransacao, setSelectedTransacao] = useState(null);
  const [contaSelecionada, setContaSelecionada] = useState(null); // Estado para guardar a conta selecionada

  const [showBuscarModal, setShowBuscarModal] = useState(false);
  const [showCriarContaPagarModal, setShowCriarContaPagarModal] = useState(false);
  const [showCriarContaReceberModal, setShowCriarContaReceberModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDesfazerModal, setShowDesfazerModal] = useState(false);
  const [showAceiteModal, setShowAceiteModal] = useState(false);
  const [recusarModalData, setRecusarModalData] = useState(null);
  const [showRecusarModal, setShowRecusarModal] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState(null);

  const [activeTab, setActiveTab] = useState('pendentes');

  const [selectedExtratoId, setSelectedExtratoId] = useState(null);

  const [novaContaAReceber, setNovaContaAReceber] = useState({
    valor: '',
    vencimento: '',
    categoria: '',
    clienteId: '',
    descricao: '',
    status: 'A receber'
  });
  const [novaContaAPagar, setNovaContaAPagar] = useState({
    valor: '',
    vencimento: '',
    categoria: '',
    fornecedorId: '',
    descricao: '',
    estaPago: false
  });


  // Notificação
  const [notification, setNotification] = useState(null);
  const handleNotificationClose = () => {
    setNotification(null);
  };

  const bancoLogos = {
    '001': require('../../assets/imgs/bbLogo.png'),
    '237': require('../../assets/imgs/bradescologo.png'),
    '341': require('../../assets/imgs/itaulogo.png'),
    '260': require('../../assets/imgs/nubanklogo.png'),
    '104': require('../../assets/imgs/caixalogo.png'),
    '403': require('../../assets/imgs/coraLogo.png'),
  };

  // Fetch categorias, fornecedores e clientes ao abrir os modais
  useEffect(() => {
    fetchCategorias();
    fetchCategoriasAReceber();
    fetchFornecedores();
    fetchClientes();
  }, [fetchCategorias, fetchFornecedores, fetchClientes, fetchCategoriasAReceber]);

  // Buscar a conta principal
  useEffect(() => {
    const fetchContaPrincipal = async () => {
      try {
        const contasData = await listarContas();
        const principal = contasData.find(conta => conta.contaPrincipal === true);
        setContaPrincipal(principal);
        if (principal) {
          const extratoData = await listarExtrato(principal.id);
          setTransacoes(extratoData);
        }
      } catch (error) {
        console.error('Erro ao buscar a conta principal ou listar extrato:', error);
      }
    };

    fetchContaPrincipal();
  }, [listarContas, listarExtrato]);

  // Fetch contas a pagar e a receber
  useEffect(() => {
    const fetchContas = async () => {
      try {
        await fetchContasAPagar();
        await fetchContasAReceber();
      } catch (error) {
        console.error('Erro ao listar contas:', error);
      }
    };
    fetchContas();
  }, [fetchContasAPagar, fetchContasAReceber]);

  // Função para capturar o arquivo selecionado e iniciar o upload automaticamente
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file || !contaPrincipal) {
      setNotification({
        title: 'Erro',
        message: 'Nenhum arquivo selecionado.',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      return;
    }

    setIsLoading(true);
    setUploadStatus("Enviando arquivo...");

    try {
      const signedData = await getSignedUrl();
      await uploadFileToS3(file, signedData);
      const fileKey = signedData.fields.key.replace(/\${filename}/, file.name);
      await submitFileKey(fileKey, contaPrincipal.id);
      setNotification({
        title: 'Sucesso!',
        message: 'Arquivo OFX enviado com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });

      // Atualiza a página automaticamente após o envio do arquivo
      const extratoAtualizado = await listarExtrato(contaPrincipal.id);
      setTransacoes(extratoAtualizado);
    } catch (error) {
      console.error('Erro durante o upload:', error);
      setNotification({
        title: 'Erro',
        message: 'Erro ao enviar o arquivo. Tente novamente.',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para solicitar a URL assinada
  async function getSignedUrl() {
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
  }

  // Função para fazer upload do arquivo para o S3
  async function uploadFileToS3(file, signedData) {
    const formData = new FormData();

    Object.keys(signedData.fields).forEach(key => {
      formData.append(key, signedData.fields[key]);
    });

    formData.append('file', file);

    try {
      const response = await axios.post(signedData.url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status !== 204) {
        throw new Error("Erro: O upload para o S3 não foi bem-sucedido.");
      }
    } catch (error) {
      console.error('Erro ao fazer upload para o S3:', error);
      throw error;
    }
  }

  // Função para enviar a chave do arquivo ao backend
  async function submitFileKey(fileKey, contaId) {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`https://api.ikont1.com.br/conta-bancaria/${contaId}/extrato`,
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
      throw error;
    }
  }

  // Função para buscar a conta conciliada
  const buscarContaConciliada = (conciliacaoId, conciliadoCom) => {
    if (conciliadoCom === 'contaAPagar') {
      return contasAPagar.find(conta => conta.id === conciliacaoId);
    } else if (conciliadoCom === 'contaAReceber') {
      return contasAReceber.find(conta => conta.id === conciliacaoId);
    }
    return null;
  };

  // Função para lidar com a submissão de uma nova conta a pagar
  const handleCriarContaPagar = async (e) => {
    e.preventDefault();
    const contaToSave = {
      valor: parseFloat(novaContaAPagar.valor.replace(',', '.')),
      vencimento: novaContaAPagar.vencimento,
      categoria: novaContaAPagar.categoria,
      fornecedorId: novaContaAPagar.fornecedorId,
      descricao: novaContaAPagar.descricao,
    };

    try {
      await addContaAPagar(contaToSave);
      setShowCriarContaPagarModal(false);

      // Resetar os campos do formulário manualmente
      setNovaContaAPagar({
        valor: '',
        vencimento: '',
        categoria: '',
        fornecedorId: '',
        descricao: '',
      });
    } catch (error) {
      console.error('Erro ao criar conta a pagar:', error);
    }
  };

  // Função para lidar com a submissão de uma nova conta a receber
  const handleCriarContaReceber = async (e) => {
    e.preventDefault();
    const contaToSave = {
      valor: parseFloat(novaContaAReceber.valor.replace(',', '.')),
      vencimento: novaContaAReceber.vencimento,
      categoria: novaContaAReceber.categoria,
      clienteId: novaContaAReceber.clienteId,
      descricao: novaContaAReceber.descricao,
    };

    try {
      await addContaAReceber(contaToSave);
      setShowCriarContaReceberModal(false);

      // Resetar os campos do formulário manualmente
      setNovaContaAReceber({
        valor: '',
        vencimento: '',
        categoria: '',
        clienteId: '',
        descricao: '',
        status: 'A receber'
      });
    } catch (error) {
      console.error('Erro ao criar conta a receber:', error);
    }
  };

  // Função para abrir o modal de edição da conta sugerida aPagar/aReceber
  const handleOpenEditModal = (contaSugerida, tipo) => {
    if (tipo === 'debito') {
      setContaSelecionada(contaSugerida);  // Marca a conta como sendo a selecionada para edição
      setNovaContaAPagar({
        valor: contaSugerida.valor.toFixed(2),
        vencimento: contaSugerida.vencimento ? contaSugerida.vencimento.split('T')[0] : '',
        categoria: contaSugerida.categoria,
        fornecedorId: contaSugerida.fornecedor?.id || '',
        descricao: contaSugerida.descricao,
      });
      setShowCriarContaPagarModal(true);
    } else if (tipo === 'credito') {
      setContaSelecionada(contaSugerida);
      setNovaContaAReceber({
        valor: contaSugerida.valor.toFixed(2),
        vencimento: contaSugerida.vencimento ? contaSugerida.vencimento.split('T')[0] : '',
        categoria: contaSugerida.categoria,
        clienteId: contaSugerida.cliente?.id || '',
        descricao: contaSugerida.descricao,
      });
      setShowCriarContaReceberModal(true);
    }
  };

  // Função para atualizar conta a pagar
  const handleAtualizarContaPagar = async (e) => {
    e.preventDefault();
    const contaToUpdate = {
      valor: parseFloat(novaContaAPagar.valor.replace(',', '.')),
      vencimento: novaContaAPagar.vencimento,
      categoria: novaContaAPagar.categoria,
      fornecedorId: novaContaAPagar.fornecedorId,
      descricao: novaContaAPagar.descricao,
      estaPago: novaContaAPagar.estaPago,
    };

    try {
      // Use contaSelecionada ao invés de contaSugerida para pegar o ID correto
      await updateContaAPagar(contaSelecionada.id, contaToUpdate);
      setShowCriarContaPagarModal(false);
      // Atualizar a lista de transações após a edição
      const extratoAtualizado = await listarExtrato(contaPrincipal.id);
      setTransacoes(extratoAtualizado);

      // Resetar os campos do formulário manualmente
      setNovaContaAPagar({
        valor: '',
        vencimento: '',
        categoria: '',
        fornecedorId: '',
        descricao: '',
      });
    } catch (error) {
      console.error('Erro ao atualizar conta a pagar:', error);
    }
  };

  // Função para atualizar conta a receber
  const handleAtualizarContaReceber = async (e) => {
    e.preventDefault();
    const contaToUpdate = {
      valor: parseFloat(novaContaAReceber.valor.replace(',', '.')),
      vencimento: novaContaAReceber.vencimento,
      categoria: novaContaAReceber.categoria,
      clienteId: novaContaAReceber.clienteId,
      descricao: novaContaAReceber.descricao,
      status: novaContaAReceber.status,
    };

    try {
      // Use contaSelecionada ao invés de contaSugerida para pegar o ID correto
      await updateContaAReceber(contaSelecionada.id, contaToUpdate);
      setShowCriarContaReceberModal(false);
      // Atualizar a lista de transações após a edição
      const extratoAtualizado = await listarExtrato(contaPrincipal.id);
      setTransacoes(extratoAtualizado);

      // Resetar os campos do formulário manualmente
      setNovaContaAReceber({
        valor: '',
        vencimento: '',
        categoria: '',
        clienteId: '',
        descricao: '',
      });
    } catch (error) {
      console.error('Erro ao atualizar conta a receber:', error);
    }
  };

  // Mostrar modal de busca ao clicar em "Buscar ou Criar" transações
  const handleBuscarOuCriar = (transacao) => {
    setSelectedTransacao(transacao);
    setShowBuscarModal(true); // Abre o modal de busca
  };

  // Função para conciliacao
  const handleConfirmConciliacao = async () => {
    if (!contaSelecionada || !selectedTransacao) {
      console.error('Erro: Conta ou transação não foram selecionadas corretamente.');
      setNotification({
        title: 'Erro',
        message: 'Erro ao realizar conciliação.',
        secondaryMessage: 'Nenhum lançamento selecionado!',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      return;
    }

    const entidade = selectedTransacao.tipo === 'debito' ? 'contaAPagar' : 'contaAReceber';
    const entidadeId = contaSelecionada.id;
    const extratoId = selectedTransacao.id;

    try {
      await criarConciliacao({ entidade, entidadeId, extratoId });

      // Atualizar a lista de transações após conciliação
      const extratoAtualizado = await listarExtrato(contaPrincipal.id);
      setTransacoes(extratoAtualizado);

      setShowConfirmationModal(false);
      setShowBuscarModal(false);
    } catch (error) {
      console.error('Erro ao realizar conciliação:', error);
    }
  };

  // Função para abrir modal de confirmar aceitar conciliacao sugerida
  const handleOpenConfirmModal = (transacao, contaSugerida) => {
    setConfirmModalData({
      transacao,
      conta: contaSugerida,
    });
    setShowAceiteModal(true); // Abre o modal de confirmação
  };

  // Função para  confirmar a acao de aceitar sugestao de conciliacao
  const handleAceiteSugestao = async () => {
    if (!confirmModalData?.transacao) {
      console.error('Erro: Transação não selecionada corretamente.');
      return;
    }

    const extratoId = confirmModalData.transacao.id;

    try {
      // Chama a rota de aceitar conciliação
      await aceitarConciliacao({ extratoId });

      // Atualizar a lista de transações após aceitar a conciliação
      const extratoAtualizado = await listarExtrato(contaPrincipal.id);
      setTransacoes(extratoAtualizado);

      // Fechar o modal de confirmação
      setShowConfirmationModal(false);
      setShowAceiteModal(false);
    } catch (error) {
      console.error('Erro ao aceitar conciliação:', error);
    }
  };

  // Função para abrir modal de confirmar a recusa de sugestão
  const handleOpenRecusarModal = (transacao) => {
    const contaSugerida = contasAPagar.find(conta => conta.id === transacao.conciliacaoId)
      || contasAReceber.find(conta => conta.id === transacao.conciliacaoId);

    if (!contaSugerida) {
      console.error('Erro: Não foi possível encontrar o lançamento correspondente à transação.');
      return;
    }

    setRecusarModalData({
      transacao,  // Verifique se transacao contém o extratoId correto
      conta: contaSugerida,
    });

    setShowRecusarModal(true); // Abre o modal de confirmação de recusa
  };


  // Função para recusar sugestão
  const handleRecusarConciliacao = async () => {
    if (!recusarModalData) {
      console.error('Erro: Transação não selecionada corretamente.');
      return;
    }

    const extratoId = recusarModalData.transacao.id;

    try {
      await recusarConciliacao(extratoId);

      const extratoAtualizado = await listarExtrato(contaPrincipal.id);
      setTransacoes(extratoAtualizado);

      // Fecha o modal de confirmação de recusa
      setShowRecusarModal(false);
    } catch (error) {
      console.error('Erro ao recusar conciliação:', error);
    }
  };



  // Função para abrir o modal de confirmação de desfazer
  const handleDesfazerClick = (extratoId) => {
    setSelectedExtratoId(extratoId);
    setShowDesfazerModal(true);
  };

  // Função para cancelar a ação de desfazer
  const handleCancelDesfazer = () => {
    setShowDesfazerModal(false);
  };

  // Função para confirmar a desfazer conciliação
  const handleConfirmDesfazer = async () => {
    try {
      await desfazerConciliacao(selectedExtratoId);

      // Atualizar a lista de transações após desfazer conciliação
      const extratoAtualizado = await listarExtrato(contaPrincipal.id);
      setTransacoes(extratoAtualizado);

      setShowDesfazerModal(false);
    } catch (error) {
      console.error('Erro ao desfazer conciliação:', error);
    }
  };

  // Nomes de tipo de conta
  const renderTipoConta = (tipo) => {
    switch (tipo) {
      case 'meiosDePagamento':
        return 'Conta de pagamento';
      case 'contaCorrente':
        return 'Conta Corrente';
      case 'poupanca':
        return 'Poupança';
      default:
        return tipo;
    }
  };


  // Função para renderizar as transações pendentes
  const renderTransacoesPendentes = () => {
    return transacoes
      .filter(transacao => transacao.conciliacaoStatus === 'naoConciliado' || transacao.conciliacaoStatus === 'sugestao')
      .map((transacao, index) => {
        // Buscar a conta sugerida usando o conciliacaoId
        const contaSugerida = contasAPagar.find(conta => conta.id === transacao.conciliacaoId)
          || contasAReceber.find(conta => conta.id === transacao.conciliacaoId);

        return (
          <div className="conciliacao-row" key={index}>
            {/* Transação do extrato */}
            <div className="conciliacao-card transacao-extrato">
              <div>
                <img src={bancoLogos[contaPrincipal.codigoBanco] || bancoLogos['default']} alt="Banco Logo" className="banco-logo-conciliacao" />
                <div>
                  <p>{new Date(transacao.dataTransacao).toLocaleDateString()}</p>
                  <p className='descricao'>{transacao.descricao}</p>
                </div>
              </div>
              <h3 style={{ color: transacao.valor < 0 ? 'red' : 'green' }}>{`R$ ${transacao.valor.toFixed(2)}`}</h3>
            </div>

            {/* Botão Conciliar/Aceitar */}
            <button
              className="desfazer-button"
              disabled={!transacao.conciliacaoSugeridaEm}
              onClick={() => transacao.conciliacaoSugeridaEm && handleOpenConfirmModal(transacao, contaSugerida)}
            >
              {transacao.conciliacaoSugeridaEm ? "Aceitar" : "Conciliar"}
            </button>


            {/* Renderiza o box da sugestão apenas para transações sugeridas */}
            {transacao.conciliacaoSugeridaEm && contaSugerida && (
              <div className="conciliacao-card sugestao-box">
                <h4>Sugestão Encontrada no financeiro</h4>
                <div className="sugestao-botoes">
                  <button onClick={() => handleOpenEditModal(contaSugerida, transacao.tipo)}>Editar</button>
                  <button onClick={() => handleOpenRecusarModal(transacao)}>Recusar</button>
                </div>
                <div className="sugestao-info">
                  <p>{new Date(contaSugerida.vencimento).toLocaleDateString()} - R$ {contaSugerida.valor.toFixed(2)} - {contaSugerida.descricao}</p>
                  <span>Número da nota - <b>{contaSugerida.numeroNota || 'N/A'}</b></span>
                </div>
              </div>
            )}

            {/* Botão de Buscar/Criar se não for sugestão */}
            {!transacao.conciliacaoSugeridaEm && (
              <div className="conciliacao-card sugestao-contas">
                <button className="buscar-ou-criar-button" onClick={() => handleBuscarOuCriar(transacao)}>
                  Buscar ou Criar
                </button>
              </div>
            )}
          </div>
        );
      });
  };

  // Função para renderizar as transações conciliadas
  const renderTransacoesConciliadas = () => {
    return transacoes
      .filter(transacao => transacao.conciliacaoStatus === 'conciliado')
      .map((transacao, index) => {
        const contaConciliada = buscarContaConciliada(transacao.conciliacaoId, transacao.conciliadoCom);

        return (
          <div className="conciliacao-row" key={index}>
            {/* Transação do extrato */}
            <div className="conciliacao-card transacao-extrato">
              <div>
                <img src={bancoLogos[contaPrincipal.codigoBanco] || bancoLogos['default']} alt="Banco Logo" className="banco-logo-conciliacao" />
                <div>
                  <p>{new Date(transacao.dataTransacao).toLocaleDateString()}</p>
                  <p className='descricao'>{transacao.descricao}</p>
                </div>
              </div>
              <h3>{`R$ ${transacao.valor.toFixed(2)}`}</h3>
            </div>

            <button className="desfazer-button" onClick={() => handleDesfazerClick(transacao.id)}>
              Desfazer
            </button>

            {/* Conta a pagar ou a receber conciliada */}
            {contaConciliada ? (
              <div className="conciliacao-card transacao-conta">
                <div>
                  <div>
                    <p>{new Date(contaConciliada.vencimento || contaConciliada.recebidoEm).toLocaleDateString()}</p>
                    -
                    <p>{contaConciliada.categoria}</p>
                  </div>
                  <p>{contaConciliada.descricao}</p>
                </div>
                <h3>{`R$ ${contaConciliada.valor.toFixed(2)}`}</h3>
              </div>
            ) : (
              <div className="conciliacao-card transacao-conta">
                <p>Conta conciliada não encontrada.</p>
              </div>
            )}
          </div>
        );
      });
  };

  if (!contaPrincipal) {
    return (
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <p>Carregando conta principal...</p>
        </div>
      </div>
    );
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
                <img src={bancoLogos[contaPrincipal.codigoBanco] || bancoLogos['default']} alt="Banco Logo" className="banco-logo-conciliacao" />
              </div>
              <div className="banco-detalhes">
                <h3>{contaPrincipal.nomeBanco}</h3>
                <div className="conta-identificadores">
                  <span>{contaPrincipal.agencia}</span>
                  <span>{`${contaPrincipal.numeroConta}-${contaPrincipal.contaDV}`}</span>
                </div>
              </div>
              <div className="icon-dropdown">
                <p>{renderTipoConta(contaPrincipal.tipo)}</p>
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
                accept=".ofx"
              />
            </div>
          </div>

          {isLoading && (
            <div className="upload-status">
              <p>{uploadStatus}</p>
            </div>
          )}

        </div>

        <div className="container-lancamentos">
          <div className="lancamentos-importados">
            <h3>Lançamentos importados</h3>
            <div className="card-banco">
              <img src={bancoLogos[contaPrincipal.codigoBanco] || bancoLogos['default']} alt="Banco do Brasil" className="banco-logo" />
              <div className="banco-dados-conciliacao">
                <p>{contaPrincipal.nomeBanco}</p>
                <span>{contaPrincipal.agencia}</span>
                <span>{`${contaPrincipal.numeroConta}-${contaPrincipal.contaDV}`}</span>
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

        <div className="transacoes-container">
          <div className={`transacoes-header ${activeTab === 'conciliadas' ? 'conciliadas-active' : 'default'}`}>
            <button
              className={`pendentes ${activeTab === 'pendentes' ? 'active' : ''}`}
              onClick={() => setActiveTab('pendentes')}
            >
              Pendentes
            </button>
            <button
              className={`conciliadas ${activeTab === 'conciliadas' ? 'active' : ''}`}
              onClick={() => setActiveTab('conciliadas')}
            >
              Conciliadas
            </button>
          </div>

          <div className="content-tabs">
            {activeTab === 'pendentes' ? (
              <div className="trasacoes-pendentes">
                {transacoes.filter(t => t.conciliacaoStatus === 'naoConciliado').length > 0 ? (
                  renderTransacoesPendentes()
                ) : (
                  <p>Nenhuma conciliação pendente</p>  // Mensagem se não houver transações pendentes
                )}
              </div>
            ) : (
              <div className="conciliadas-container">
                {transacoes.filter(t => t.conciliacaoStatus === 'conciliado').length > 0 ? (
                  renderTransacoesConciliadas()
                ) : (
                  <p>Nenhuma transação conciliada</p>  // Mensagem se não houver transações conciliadas
                )}
              </div>
            )}
          </div>

        </div>


        {/* Modal para buscar/criar conta */}
        {showBuscarModal && (
          <Modal
            isOpen={showBuscarModal}
            onClose={() => setShowBuscarModal(false)}
            title="Conciliar Transação"
            size="large"
          >
            <div className="modal-conciliar">
              {/* Dados da transação */}
              <div className="conciliacao-card transacao-extrato">
                <div>
                  <img src={bancoLogos[contaPrincipal.codigoBanco] || bancoLogos['default']} alt="Banco Logo" className="banco-logo-conciliacao" />
                  <div>
                    <p>{contaPrincipal.nomeBanco}</p>
                    <p className='data'>{new Date(selectedTransacao?.dataTransacao).toLocaleDateString()}</p>
                  </div>
                </div>
                <h3 style={{ color: selectedTransacao.valor < 0 ? 'red' : 'green' }}>{`R$ ${selectedTransacao?.valor.toFixed(2)}`}</h3>
              </div>

              {/* Aqui irá a tabela de contas */}
              <div className="buscar-conta-tabela">
                <div className='container-button-add-conta'>
                  <h5>Buscar lançamento</h5>
                  <button onClick={() => {
                    setShowBuscarModal(false); // Fecha o modal de busca
                    if (selectedTransacao.tipo === 'debito') {
                      setShowCriarContaPagarModal(true); // Abre o modal de criar conta a pagar
                    } else {
                      setShowCriarContaReceberModal(true); // Abre o modal de criar conta a receber
                    }
                  }}>
                    Criar novo
                  </button>

                </div>

                <div className='table-contas-conciliacao'>
                  <table className='table'>
                    <thead>
                      <tr style={{ backgroundColor: 'transparent' }}>
                        <th>Data</th>
                        <th>Vencimento</th>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Selecionar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransacao?.tipo === 'debito'
                        ? contasAPagar
                          .filter((conta) => conta.conciliacao.status !== 'conciliado') // Filtra contas conciliadas
                          .map((conta) => (
                            <tr key={conta.id}>
                              <td>{new Date(conta.criadoEm).toLocaleDateString()}</td>
                              <td>{new Date(conta.vencimento).toLocaleDateString()}</td>
                              <td>{conta.descricao}</td>
                              <td>{`R$ ${conta.valor.toFixed(2)}`}</td>
                              <td>
                                <input
                                  type="radio"
                                  name="conta-selecionada"
                                  value={conta.id}
                                  onChange={() => {
                                    setContaSelecionada(conta); // Certifique-se de que está setando a conta selecionada
                                  }}
                                />
                              </td>
                            </tr>
                          ))
                        : contasAReceber
                          .filter((conta) => conta.conciliacao.status !== 'conciliado') // Filtra contas conciliadas
                          .map((conta) => (
                            <tr key={conta.id}>
                              <td>{new Date(conta.criadoEm).toLocaleDateString()}</td>
                              <td>{new Date(conta.vencimento).toLocaleDateString()}</td>
                              <td>{conta.descricao}</td>
                              <td>{`R$ ${conta.valor.toFixed(2)}`}</td>
                              <td>
                                <input
                                  type="radio"
                                  name="conta-selecionada"
                                  value={conta.id}
                                  onChange={() => {
                                    setContaSelecionada(conta); // Certifique-se de que está setando a conta selecionada
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>

              </div>
              <button className="conciliar-button" onClick={() => { setShowConfirmationModal(true) }}>
                Conciliar
              </button>
            </div>
          </Modal>
        )}

        {/* Modal para Criar Conta a Pagar */}
        {showCriarContaPagarModal && (
          <Modal isOpen={showCriarContaPagarModal} onClose={() => setShowCriarContaPagarModal(false)} title={contaSelecionada ? "Editar conta a pagar" : "Nova conta a pagar"}>
            <form onSubmit={contaSelecionada ? handleAtualizarContaPagar : handleCriarContaPagar}> {/* Condicional no onSubmit */}
              <div className="form-group">
                <label htmlFor="valor">Valor</label>
                <FormattedInput
                  type="valor"
                  id="valor"
                  name="valor"
                  value={novaContaAPagar.valor}
                  onChange={(e) => setNovaContaAPagar({ ...novaContaAPagar, valor: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="vencimento">Vencimento</label>
                <input
                  type="date"
                  id="vencimento"
                  name="vencimento"
                  value={novaContaAPagar.vencimento}
                  onChange={(e) => setNovaContaAPagar({ ...novaContaAPagar, vencimento: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="categoria">Categoria</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={novaContaAPagar.categoria}
                  onChange={(e) => setNovaContaAPagar({ ...novaContaAPagar, categoria: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria, index) => (
                    <option key={index} value={categoria.id}>{categoria}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="fornecedorId">Fornecedor</label>
                <select
                  id="fornecedorId"
                  name="fornecedorId"
                  value={novaContaAPagar.fornecedorId}
                  onChange={(e) => setNovaContaAPagar({ ...novaContaAPagar, fornecedorId: e.target.value })}
                  required
                >
                  <option value="">Selecione um fornecedor</option>
                  {fornecedores.map((fornecedor) => (
                    <option key={fornecedor.id} value={fornecedor.id}>{fornecedor.nomeFantasia}</option>
                  ))}
                </select>

              </div>
              <div className="form-group">
                <label htmlFor="descricao">Descrição (Opcional)</label>
                <input
                  type="text"
                  id="descricao"
                  name="descricao"
                  value={novaContaAPagar.descricao}
                  onChange={(e) => setNovaContaAPagar({ ...novaContaAPagar, descricao: e.target.value })}
                />
              </div>
              <button type="submit">Salvar</button>
            </form>
          </Modal>
        )}

        {/* Modal para Criar Conta a Receber */}
        {showCriarContaReceberModal && (
          <Modal isOpen={showCriarContaReceberModal} onClose={() => setShowCriarContaReceberModal(false)} title={contaSelecionada ? "Editar conta a receber" : "Nova conta a receber"}>
            <form onSubmit={contaSelecionada ? handleAtualizarContaReceber : handleCriarContaReceber}> {/* Condicional no onSubmit */}
              <div className="form-group">
                <label htmlFor="valor">Valor</label>
                <FormattedInput
                  type="valor"
                  id="valor"
                  name="valor"
                  value={novaContaAReceber.valor}
                  onChange={(e) => setNovaContaAReceber({ ...novaContaAReceber, valor: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="vencimento">Vencimento</label>
                <input
                  type="date"
                  id="vencimento"
                  name="vencimento"
                  value={novaContaAReceber.vencimento}
                  onChange={(e) => setNovaContaAReceber({ ...novaContaAReceber, vencimento: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="categoria">Categoria</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={novaContaAReceber.categoria}
                  onChange={(e) => setNovaContaAReceber({ ...novaContaAReceber, categoria: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categoriasAReceber.map((categoria, index) => (
                    <option key={index} value={categoria.id}>{categoria}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="clienteId">Cliente</label>
                <select
                  id="clienteId"
                  name="clienteId"
                  value={novaContaAReceber.clienteId} // Certifique-se de que está recebendo o valor correto do estado
                  onChange={(e) => setNovaContaAReceber({ ...novaContaAReceber, clienteId: e.target.value })}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nomeFantasia}</option>
                  ))}
                </select>

              </div>
              <div className="form-group">
                <label htmlFor="descricao">Descrição (Opcional)</label>
                <input
                  type="text"
                  id="descricao"
                  name="descricao"
                  value={novaContaAReceber.descricao}
                  onChange={(e) => setNovaContaAReceber({ ...novaContaAReceber, descricao: e.target.value })}
                />
              </div>
              <button type="submit">Salvar</button>
            </form>
          </Modal>
        )}

        {/* Modal de Confirmação desfazer conciliacao */}
        {showDesfazerModal && (
          <ConfirmationModal
            title="Desfazer conciliação"
            message="Tem certeza que deseja realizar essa ação?"
            onConfirm={handleConfirmDesfazer}
            onCancel={handleCancelDesfazer}
          />
        )}

        {/* Modal de fonfirmar conciliacao manual */}
        {showConfirmationModal && (
          <ConfirmationModal
            title="Confirmar Conciliação"
            message={`Transação: Valor R$ ${selectedTransacao?.valor?.toFixed(2) || '0.00'} Vencimento: ${new Date(selectedTransacao?.dataTransacao).toLocaleDateString() || 'Data não disponível'}`}
            secondaryMessage={`Lançamento: Valor R$ ${contaSelecionada?.valor?.toFixed(2) || '0.00'} Vencimento: ${new Date(contaSelecionada?.vencimento).toLocaleDateString() || 'Data não disponível'}`}
            onConfirm={handleConfirmConciliacao}
            onCancel={() => setShowConfirmationModal(false)}
          />
        )}

        {/* Modal de aceitar conciliacao sugerida */}
        {showAceiteModal && (
          <ConfirmationModal
            title="Aceitar Conciliação"
            message={`Transação: Valor R$ ${confirmModalData?.transacao?.valor?.toFixed(2) || '0.00'} Vencimento: ${new Date(confirmModalData?.transacao?.dataTransacao).toLocaleDateString() || 'Data não disponível'}`}
            secondaryMessage={`Lançamento: Valor R$ ${confirmModalData?.conta?.valor?.toFixed(2) || '0.00'} Vencimento: ${new Date(confirmModalData?.conta?.vencimento).toLocaleDateString() || 'Data não disponível'}`}
            onConfirm={handleAceiteSugestao}
            onCancel={() => setShowAceiteModal(false)}
          />
        )}

        {/* Modal de recusar conciliação sugerida */}
        {showRecusarModal && recusarModalData && (
          <ConfirmationModal
            title="Recusar Sugestao"
            message={`Transação: Valor R$ ${recusarModalData.transacao.valor.toFixed(2)} - Vencimento: ${new Date(recusarModalData.transacao.dataTransacao).toLocaleDateString()}`}
            secondaryMessage={`Lançamento: Valor R$ ${recusarModalData.conta?.valor.toFixed(2) || '0.00'} - Vencimento: ${new Date(recusarModalData.conta?.vencimento).toLocaleDateString() || 'Data não disponível'}`}
            onConfirm={handleRecusarConciliacao}
            onCancel={() => setShowRecusarModal(false)}
          />
        )}



        {/* Notificação */}
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

      </div>
    </div>
  );
};

export default Conciliacao;
