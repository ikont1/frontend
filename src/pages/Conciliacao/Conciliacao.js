import React, { useState, useEffect, useCallback } from 'react';
import './Conciliacao.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { Upload, ArrowLeft, ArrowRight, AlertTriangle, ThumbsUp } from 'react-feather';
import axios from 'axios';
import { useWallet } from '../../context/WalletContext';
import { useConciliacao } from '../../context/ConciliacaoContext';
import { useFinance } from '../../context/FinanceContext';
import { useClientSupplier } from '../../context/ClientSupplierContext';
import ConfirmationModal from '../../components/Modal/confirmationModal';
import Modal from '../../components/Modal/Modal';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import Notification from '../../components/Notification/Notification';
import FilterBarConciliacao from '../../components/FilterConciliacao/FilterBarConciliacao';
import Lottie from 'react-lottie';
import animationData from '../../lottieflow-scrolling-01-1-ffffff-easey.json'; // Animação Lottie


const Conciliacao = () => {
  const { listarContas, listarExtrato } = useWallet();
  const { desfazerConciliacao, criarConciliacao, aceitarConciliacao, recusarConciliacao } = useConciliacao();
  const { fetchContasAReceber, fetchContasAPagar, addContaAPagar, addContaAReceber, contasAPagar, contasAReceber, updateContaAPagar, updateContaAReceber, fetchCategorias, categorias, categoriasAReceber, fetchCategoriasAReceber } = useFinance();
  const { fetchClientes, clientes, fetchFornecedores, fornecedores } = useClientSupplier();

  const [isLoading, setIsLoading] = useState(false);
  const [todasContas, setTodasContas] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [subTipoFiltro, setSubTipoFiltro] = useState('');
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [selectedContaConciliacao, setSelectedContaConciliacao] = useState(null);
  const [selectedTransacao, setSelectedTransacao] = useState(null);

  const [showBuscarModal, setShowBuscarModal] = useState(false);
  const [showCriarContaPagarModal, setShowCriarContaPagarModal] = useState(false);
  const [showCriarContaReceberModal, setShowCriarContaReceberModal] = useState(false);
  const [contaAEditar, setContaAEditar] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDesfazerModal, setShowDesfazerModal] = useState(false);
  const [showAceiteModal, setShowAceiteModal] = useState(false);
  const [recusarModalData, setRecusarModalData] = useState(null);
  const [showRecusarModal, setShowRecusarModal] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState(null);

  // Adicionar estados para os filtros
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [descricaoFiltro, setDescricaoFiltro] = useState('');

  // Estados para a paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [todasTransacoes, setTodasTransacoes] = useState([]);
  const [itensPaginados, setItensPaginados] = useState([]);


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
    '077': require('../../assets/imgs/interLogo.png'),

  };

  // Configuração do Lottie
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };
  // Função para lidar com a mudança dos filtros

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // Atualizar os filtros conforme o campo alterado
    if (name === 'startDate') setStartDate(value);
    if (name === 'endDate') setEndDate(value);
    if (name === 'categoria') setCategoriaSelecionada(value);
    if (name === 'descricao') setDescricaoFiltro(value);
    if (name === 'subTipo') { setSubTipoFiltro(value) };
  };
 
  // Limpar o formulário de criar conta a receber quando o modal for fechado
  useEffect(() => {
    if (!showCriarContaReceberModal) {
      setNovaContaAReceber({
        valor: '',
        vencimento: '',
        categoria: '',
        clienteId: '',
        descricao: '',
        status: 'A receber'
      });
      // Removido o setContaSelecionada(null)
    }
  }, [showCriarContaReceberModal]);

  useEffect(() => {
    fetchCategorias();
    fetchCategoriasAReceber();
    fetchFornecedores();
    fetchClientes();

    // para carregar as contas ao montar o componente.
    const carregarContas = async () => {
      try {
        await fetchContasAReceber();
        await fetchContasAPagar();
      } catch (error) {
        console.error('Erro ao carregar contas a receber ou a pagar:', error);
      }
    };

    carregarContas();
  }, [fetchCategorias, fetchFornecedores, fetchClientes, fetchCategoriasAReceber, fetchContasAReceber, fetchContasAPagar]);

  // Função para buscar todas as contas e definir conta principal como padrão
  useEffect(() => {
    const fetchContas = async () => {
      try {
        const contasData = await listarContas();
        setTodasContas(contasData); // Armazena todas as contas

        const principal = contasData.find(conta => conta.contaPrincipal === true);
        if (principal) {
          setContaSelecionada(principal); // Define a conta principal como conta selecionada
          const extratoData = await listarExtrato(principal.id);
          setTransacoes([...extratoData].sort((a, b) => {
            if (a.conciliacaoSugeridaEm && !b.conciliacaoSugeridaEm) return -1;
            if (!a.conciliacaoSugeridaEm && b.conciliacaoSugeridaEm) return 1;
            return new Date(b.dataTransacao) - new Date(a.dataTransacao);
          })); // Carrega o extrato da conta principal
        }
      } catch (error) {
        console.error('Erro ao listar contas ou buscar o extrato:', error);
      }
    };

    fetchContas();
  }, [listarContas, listarExtrato]);

  // Atualizar as transações ao mudar a conta selecionada
  useEffect(() => {
    if (contaSelecionada) {
      listarExtrato(contaSelecionada.id)
        .then((extratoAtualizado) => {
          const ordenadas = [...extratoAtualizado].sort((a, b) => {
            if (a.conciliacaoSugeridaEm && !b.conciliacaoSugeridaEm) return -1;
            if (!a.conciliacaoSugeridaEm && b.conciliacaoSugeridaEm) return 1;
            return new Date(b.dataTransacao) - new Date(a.dataTransacao);
          });
          setTodasTransacoes(ordenadas); // Armazena todas as transações
          setTotalPaginas(Math.ceil(ordenadas.length / itensPorPagina)); // Calcula o total de páginas
          setPaginaAtual(1); // Reseta para a primeira página
          paginarItens(ordenadas, 1, itensPorPagina); // Pagina a primeira página
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            setTodasTransacoes([]);
            setItensPaginados([]);
          } else {
            console.error("Erro ao listar o extrato:", error);
          }
        });
    }
  }, [contaSelecionada, listarExtrato, itensPorPagina]);

  // Função para capturar o arquivo selecionado e iniciar o upload automaticamente
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file || !contaSelecionada) {
      setNotification({
        title: 'Erro',
        message: 'Nenhum arquivo selecionado ou conta não selecionada.',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: () => setNotification(null) }]
      });
      return;
    }

    setIsLoading(true);

    try {
      const signedData = await getSignedUrl();
      await uploadFileToS3(file, signedData);
      const fileKey = signedData.fields.key.replace(/\${filename}/, file.name);
      await submitFileKey(fileKey, contaSelecionada.id);
      setNotification({
        title: 'Sucesso!',
        message: 'Arquivo OFX enviado com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setNotification(null) }]
      });

      const extratoAtualizado = await listarExtrato(contaSelecionada.id);
      setTransacoes([...extratoAtualizado].sort((a, b) => {
        if (a.conciliacaoSugeridaEm && !b.conciliacaoSugeridaEm) return -1;
        if (!a.conciliacaoSugeridaEm && b.conciliacaoSugeridaEm) return 1;
        return new Date(b.dataTransacao) - new Date(a.dataTransacao);
      }));
    } catch (error) {
      setNotification({
        title: 'Erro',
        message: 'Erro ao enviar o arquivo. Tente novamente.',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: () => setNotification(null) }]
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
      console.log("Enviando chave do arquivo:", fileKey, "para a conta:", contaId); // Verificar os dados da conta e do arquivo
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
      console.error('Erro ao enviar a chave do arquivo para o backend:', error.response?.data || error.message);
      throw error;
    }
  }

  // Função para buscar a conta conciliada
  const buscarContaConciliada = useCallback((conciliacaoId, conciliadoCom) => {
    if (conciliadoCom === 'contaAPagar') {
      return contasAPagar.find(conta => conta.id === conciliacaoId);
    } else if (conciliadoCom === 'contaAReceber') {
      return contasAReceber.find(conta => conta.id === conciliacaoId);
    }
    return null;
  }, [contasAPagar, contasAReceber]);


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
      });
    } catch (error) {
      console.error('Erro ao criar conta a receber:', error);
    }
  };

  // Função para abrir o modal de edição da conta sugerida aPagar/aReceber
  const handleOpenEditModal = (contaSugerida, tipo) => {
    setContaAEditar(contaSugerida); // Define a conta em edição
    if (tipo === 'debito') {
      setNovaContaAPagar({
        valor: contaSugerida.valor.toFixed(2),
        vencimento: contaSugerida.vencimento ? contaSugerida.vencimento.split('T')[0] : '',
        categoria: contaSugerida.categoria,
        fornecedorId: contaSugerida.fornecedor?.id || '',
        descricao: contaSugerida.descricao,
      });
      setShowCriarContaPagarModal(true);
    } else if (tipo === 'credito') {
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
      await updateContaAPagar(contaAEditar.id, contaToUpdate); // Usar `contaAEditar.id` para atualizar
      setShowCriarContaPagarModal(false);

      // Atualizar a lista de transações após a edição
      const extratoAtualizado = await listarExtrato(contaSelecionada.id);
      setTransacoes([...extratoAtualizado].sort((a, b) => {
        if (a.conciliacaoSugeridaEm && !b.conciliacaoSugeridaEm) return -1;
        if (!a.conciliacaoSugeridaEm && b.conciliacaoSugeridaEm) return 1;
        return new Date(b.dataTransacao) - new Date(a.dataTransacao);
      }));

      // Resetar os campos do formulário manualmente
      setNovaContaAPagar({
        valor: '',
        vencimento: '',
        categoria: '',
        fornecedorId: '',
        descricao: '',
      });

      // Resetar o estado da conta em edição após a atualização
      setContaAEditar(null);
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
      await updateContaAReceber(contaAEditar.id, contaToUpdate); // Usar `contaAEditar.id` para atualizar
      setShowCriarContaReceberModal(false);

      // Atualizar a lista de transações após a edição
      const extratoAtualizado = await listarExtrato(contaSelecionada.id);
      setTransacoes([...extratoAtualizado].sort((a, b) => {
        if (a.conciliacaoSugeridaEm && !b.conciliacaoSugeridaEm) return -1;
        if (!a.conciliacaoSugeridaEm && b.conciliacaoSugeridaEm) return 1;
        return new Date(b.dataTransacao) - new Date(a.dataTransacao);
      }));

      // Resetar os campos do formulário manualmente
      setNovaContaAReceber({
        valor: '',
        vencimento: '',
        categoria: '',
        clienteId: '',
        descricao: '',
      });

      // Resetar o estado da conta em edição após a atualização
      setContaAEditar(null);
    } catch (error) {
      console.error('Erro ao atualizar conta a receber:', error);
    }
  };

  // Função para confirmar a conciliação manual
  const handleConfirmConciliacao = async () => {
    if (!contaSelecionada || !selectedTransacao) {
      console.error('Erro: Conta ou transação não foram selecionadas corretamente.');
      setNotification({
        title: 'Erro',
        message: 'Erro ao realizar conciliação.',
        type: 'error',
        icon: AlertTriangle,
        buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
      });
      return;
    }

    const entidade = selectedTransacao.tipo === 'debito' ? 'contaAPagar' : 'contaAReceber';
    const entidadeId = selectedContaConciliacao.id;
    const extratoId = selectedTransacao.id;

    try {
      await criarConciliacao({ entidade, entidadeId, extratoId });

      // Atualizar a lista de transações após conciliação
      const extratoAtualizado = await listarExtrato(contaSelecionada.id);
      setTransacoes([...extratoAtualizado].sort((a, b) => {
        if (a.conciliacaoSugeridaEm && !b.conciliacaoSugeridaEm) return -1;
        if (!a.conciliacaoSugeridaEm && b.conciliacaoSugeridaEm) return 1;
        return new Date(b.dataTransacao) - new Date(a.dataTransacao);
      }));

      setShowConfirmationModal(false);
      setShowBuscarModal(false);
    } catch (error) {
      console.error('Erro ao realizar conciliação:', error);
    }
  };

  // Função para abrir modal de confirmação de conciliação
  const handleOpenConfirmModal = (transacao, contaSugerida) => {
    setConfirmModalData({
      transacao,
      conta: contaSugerida,
    });
    setShowAceiteModal(true); // Abre o modal de confirmação
  };

  // Função para aceitar sugestão de conciliação
  const handleAceiteSugestao = async () => {
    if (!confirmModalData?.transacao) {
      console.error('Erro: Transação não selecionada corretamente.');
      return;
    }

    const extratoId = confirmModalData.transacao.id;

    try {
      await aceitarConciliacao({ extratoId });

      // Atualizar a lista de transações após aceitar a conciliação
      const extratoAtualizado = await listarExtrato(contaSelecionada.id);
      setTransacoes([...extratoAtualizado].sort((a, b) => {
        if (a.conciliacaoSugeridaEm && !b.conciliacaoSugeridaEm) return -1;
        if (!a.conciliacaoSugeridaEm && b.conciliacaoSugeridaEm) return 1;
        return new Date(b.dataTransacao) - new Date(a.dataTransacao);
      }));

      setShowConfirmationModal(false);
      setShowAceiteModal(false);
    } catch (error) {
      console.error('Erro ao aceitar conciliação:', error);
    }
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

      const extratoAtualizado = await listarExtrato(contaSelecionada.id);
      setTransacoes([...extratoAtualizado].sort((a, b) => new Date(b.dataTransacao) - new Date(a.dataTransacao)));

      setShowRecusarModal(false);
    } catch (error) {
      console.error('Erro ao recusar conciliação:', error);
    }
  };

  // Função para desfazer conciliação
  const handleConfirmDesfazer = async () => {
    try {
      await desfazerConciliacao(selectedExtratoId);

      // Atualizar a lista de transações após desfazer conciliação
      const extratoAtualizado = await listarExtrato(contaSelecionada.id);
      setTransacoes([...extratoAtualizado].sort((a, b) => new Date(b.dataTransacao) - new Date(a.dataTransacao)));

      setShowDesfazerModal(false);
    } catch (error) {
      console.error('Erro ao desfazer conciliação:', error);
    }
  };

  // Funções faltantes:
  const handleOpenRecusarModal = (transacao) => {
    const contaSugerida = contasAPagar.find(conta => conta.id === transacao.conciliacaoId)
      || contasAReceber.find(conta => conta.id === transacao.conciliacaoId);

    if (!contaSugerida) {
      console.error('Erro: Não foi possível encontrar o lançamento correspondente à transação.');
      return;
    }

    setRecusarModalData({
      transacao,
      conta: contaSugerida,
    });
    setShowRecusarModal(true);
  };


  const handleBuscarOuCriar = (transacao) => {
    setSelectedTransacao(transacao);
    setShowBuscarModal(true);
  };

  const handleDesfazerClick = (extratoId) => {
    setSelectedExtratoId(extratoId);
    setShowDesfazerModal(true);
  };

  // Função para lidar com a seleção de uma conta a pagar/receber durante a conciliação
  const handleSelectContaConciliacao = (conta) => {
    setSelectedContaConciliacao(conta); // Usar um estado separado para a conta de conciliação
  };

  // Função para aplicar os filtros nas transações com base na aba ativa
  const filtrarTransacoes = useCallback(() => {
    let transacoesFiltradas = transacoes;

    // Filtrar com base na aba ativa
    if (activeTab === 'conciliadas') {
      transacoesFiltradas = transacoes.filter(transacao => transacao.conciliacaoStatus === 'conciliado');
    } else if (activeTab === 'pendentes') {
      transacoesFiltradas = transacoes.filter(transacao => transacao.conciliacaoStatus === 'naoConciliado' || transacao.conciliacaoStatus === 'sugestao');
    }

    return transacoesFiltradas.filter((transacao) => {
      const dataTransacao = new Date(transacao.dataTransacao);
      const dataInicioValida = !startDate || dataTransacao >= new Date(startDate);
      const dataFimValida = !endDate || dataTransacao <= new Date(endDate);
      const categoriaValida = !categoriaSelecionada || (
        (categoriaSelecionada === 'a Pagar' && transacao.tipo === 'debito') ||
        (categoriaSelecionada === 'a Receber' && transacao.tipo === 'credito')
      );
      const descricaoTransacaoValida = !descricaoFiltro || transacao.descricao.toLowerCase().includes(descricaoFiltro.toLowerCase());

      // Verificar se existe uma conta conciliada (aPagar ou aReceber)
      const contaConciliada = buscarContaConciliada(transacao.conciliacaoId, transacao.conciliadoCom);
      const descricaoContaValida = !descricaoFiltro || (contaConciliada && contaConciliada.descricao.toLowerCase().includes(descricaoFiltro.toLowerCase()));

      // Novo filtro de subTipoFiltro
      const subTipoValido = !subTipoFiltro || transacao.subTipo === subTipoFiltro;

      return dataInicioValida && dataFimValida && categoriaValida && (descricaoTransacaoValida || descricaoContaValida) && subTipoValido;
    });
  }, [transacoes, startDate, endDate, categoriaSelecionada, descricaoFiltro, subTipoFiltro, activeTab, buscarContaConciliada]);

  // Aplicar os filtros nas transações e atualizar a paginação
  useEffect(() => {
    const transacoesFiltradas = filtrarTransacoes();
    const ordenadas = [...transacoesFiltradas].sort((a, b) => {
      if (a.conciliacaoSugeridaEm && !b.conciliacaoSugeridaEm) return -1;
      if (!a.conciliacaoSugeridaEm && b.conciliacaoSugeridaEm) return 1;
      return new Date(b.dataTransacao) - new Date(a.dataTransacao);
    });
    setTodasTransacoes(ordenadas);
    setTotalPaginas(Math.ceil(ordenadas.length / itensPorPagina));
    setPaginaAtual(1); // Sempre redefinir para a primeira página ao filtrar
    paginarItens(ordenadas, 1, itensPorPagina);
  }, [filtrarTransacoes, itensPorPagina, activeTab]);

  // Alterar a página e recarregar os itens paginados
  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      const novaPagina = paginaAtual + 1;
      setPaginaAtual(novaPagina);
      paginarItens(todasTransacoes, novaPagina, itensPorPagina);
    }
  };

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) {
      const novaPagina = paginaAtual - 1;
      setPaginaAtual(novaPagina);
      paginarItens(todasTransacoes, novaPagina, itensPorPagina);
    }
  };

  // Atualize a função paginarItens para alterar diretamente a visualização dos itens paginados
  const paginarItens = (itens, pagina, itensPorPagina) => {
    const inicio = (pagina - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const paginados = itens.slice(inicio, fim);
    setItensPaginados(paginados); // Atualiza itensPaginados para renderizar os itens da página atual
  };

  // Função para mudar a aba e resetar filtros
  const handleChangeTab = (tab) => {
    setActiveTab(tab);
    setPaginaAtual(1); // Sempre definir para a página 1 ao mudar a aba

    // Resetar filtros ao mudar de aba
    setStartDate(null);
    setEndDate(null);
    setCategoriaSelecionada('');
    setDescricaoFiltro('');

    if (tab === 'conciliadas') {
      const transacoesConciliadas = todasTransacoes.filter(transacao => transacao.conciliacaoStatus === 'conciliado');
      setTotalPaginas(Math.ceil(transacoesConciliadas.length / itensPorPagina));
      paginarItens(transacoesConciliadas, 1, itensPorPagina);
    } else if (tab === 'pendentes') {
      const transacoesPendentes = todasTransacoes.filter(transacao => transacao.conciliacaoStatus === 'naoConciliado' || transacao.conciliacaoStatus === 'sugestao');
      setTotalPaginas(Math.ceil(transacoesPendentes.length / itensPorPagina));
      paginarItens(transacoesPendentes, 1, itensPorPagina);
    }
  };


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

  // Utilitário para formatar CNPJ
  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  // Renderizar transações pendentes aplicando os filtros
  const renderTransacoesPendentes = () => {
    return itensPaginados
      .filter(transacao => transacao.conciliacaoStatus === 'naoConciliado' || transacao.conciliacaoStatus === 'sugestao')
      .map((transacao, index) => {
        const contaSugerida = contasAPagar.find(conta => conta.id === transacao.conciliacaoId)
          || contasAReceber.find(conta => conta.id === transacao.conciliacaoId);

        return (
          <div className="conciliacao-row" key={index}>
            <div className="conciliacao-card transacao-extrato">
              <div>
                <img src={bancoLogos[contaSelecionada.codigoBanco] || bancoLogos['default']} alt="Banco Logo" className="banco-logo-conciliacao" />
                <div>
                  <p>{new Date(transacao.dataTransacao).toLocaleDateString()}</p>
                  <p className='descricao'>{transacao.descricao}</p>
                </div>
              </div>
              <h3 style={{ color: transacao.valor < 0 ? 'red' : 'green' }}>{`R$ ${transacao.valor.toFixed(2)}`}</h3>
            </div>

            <button
              className="desfazer-button"
              disabled={!transacao.conciliacaoSugeridaEm}
              onClick={() => transacao.conciliacaoSugeridaEm && handleOpenConfirmModal(transacao, contaSugerida)}
            >
              {transacao.conciliacaoSugeridaEm ? "Aceitar" : "Conciliar"}
            </button>

            {transacao.conciliacaoSugeridaEm && contaSugerida && (
              <div className="conciliacao-card sugestao-box">
                <h4>Sugestão Encontrada no financeiro</h4>
                <div className="sugestao-botoes">
                  <button onClick={() => handleOpenEditModal(contaSugerida, transacao.tipo)}>Editar</button>
                  <button onClick={() => handleOpenRecusarModal(transacao)}>Recusar</button>
                </div>
                <div className="sugestao-info">
                  <span>{new Date(contaSugerida.vencimento).toLocaleDateString()} - R$ {contaSugerida.valor.toFixed(2)} - {contaSugerida.descricao}</span>
                  <p>Número da nota - <b>{contaSugerida.nf?.nNF || 'N/A'}</b></p>
                  <p>Cliente - <b>{contaSugerida.nf?.emitXNome || 'N/A'}</b></p>
                  <p>CNPJ - <b>{contaSugerida.nf?.emitCpfCnpj ? formatCNPJ(contaSugerida.nf?.emitCpfCnpj) : 'N/A'}</b></p>
                </div>
              </div>
            )}

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


  // Renderizar transações conciliadas aplicando os filtros
  const renderTransacoesConciliadas = () => {
    return itensPaginados
      .filter(transacao => transacao.conciliacaoStatus === 'conciliado')
      .map((transacao, index) => {
        const contaConciliada = buscarContaConciliada(transacao.conciliacaoId, transacao.conciliadoCom);

        return (
          <div className="conciliacao-row" key={index}>
            <div className="conciliacao-card transacao-extrato">
              <div>
                <img src={bancoLogos[contaSelecionada.codigoBanco] || bancoLogos['default']} alt="Banco Logo" className="banco-logo-conciliacao" />
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

            {contaConciliada ? (
              <div className="conciliacao-card transacao-conta">
                <div>
                  <div>
                    <p>{new Date(contaConciliada.vencimento || contaConciliada.recebidoEm).toLocaleDateString()}</p>
                    -
                    <p>{contaConciliada.categoria}</p>
                  </div>
                  <p>{contaConciliada.descricao}</p>
                  {/* Exibir CNPJ formatado se existir */}
                  {contaConciliada.nf && contaConciliada.nf.emitCpfCnpj && (
                    <p>CNPJ - <b>{formatCNPJ(contaConciliada.nf.emitCpfCnpj)}</b></p>
                  )}
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


  if (!contaSelecionada) {
    return (
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <p>Nenhuma conta cadastrada...</p>
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
              <div className='div-tipo-conta'>
                <div className="banco-logo-container">
                  <img src={bancoLogos[contaSelecionada.codigoBanco] || bancoLogos['default']} alt="Banco Logo" className="banco-logo-conciliacao" />
                </div>
                <div className="banco-detalhes">
                  <h3>{contaSelecionada.nomeBanco}</h3>
                  <div className="conta-identificadores">
                    <p>{renderTipoConta(contaSelecionada.tipo)}</p>
                  </div>
                </div>
              </div>
              <select
                className="icon-dropdown"
                value={contaSelecionada?.id || ""}
                onChange={async (e) => {
                  const novaConta = todasContas.find(conta => conta.id === parseInt(e.target.value));
                  setContaSelecionada(novaConta); // Atualiza a conta selecionada

                  if (novaConta) {
                    try {
                      const extratoAtualizado = await listarExtrato(novaConta.id); // Carrega o extrato da nova conta
                      setTransacoes([...extratoAtualizado].sort((a, b) => {
                        if (a.conciliacaoSugeridaEm && !b.conciliacaoSugeridaEm) return -1;
                        if (!a.conciliacaoSugeridaEm && b.conciliacaoSugeridaEm) return 1;
                        return new Date(b.dataTransacao) - new Date(a.dataTransacao);
                      })); // Atualiza as transações exibidas
                    } catch (error) {
                      console.error('Erro ao carregar o extrato da nova conta:', error);
                    }
                  }
                }}

              >
                {todasContas
                  .filter(contas => contas.status === 'ativo')
                  .map(conta => (
                    <option key={conta.id} value={conta.id}>
                      {conta.nomeBanco} - {conta.agencia}/{`${conta.numeroConta}-${conta.contaDV}`}
                    </option>
                  ))}
              </select>


            </div>

            {/* Iportar extrato */}
            {!isLoading ? (
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
                  style={{ display: 'none', zIndex: 999 }}
                  onChange={handleFileChange}
                  accept=".ofx"
                />
              </div>
            ) : (
              <div className="upload-status">
                <Lottie options={defaultOptions} height={50} width={50} />
              </div>
            )}
          </div>


        </div>

        <div className="container-lancamentos">
          <div className="lancamentos-importados">
            <h3>Lançamentos importados</h3>
            <div className="card-banco">
              <img src={bancoLogos[contaSelecionada.codigoBanco] || bancoLogos['default']} alt="Banco do Brasil" className="banco-logo" />
              <div className="banco-dados-conciliacao">
                <p>{contaSelecionada.nomeBanco}</p>
                <span>{contaSelecionada.agencia}</span>
                <span>{`${contaSelecionada.numeroConta}-${contaSelecionada.contaDV}`}</span>
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
          {/* Tabs para pendentes e conciliadas */}
          <div className={`transacoes-header ${activeTab === 'conciliadas' ? 'conciliadas-active' : 'default'}`}>
            <button
              className={`pendentes ${activeTab === 'pendentes' ? 'active' : ''}`}
              onClick={() => handleChangeTab('pendentes')}
            >
              Pendentes
            </button>
            <button
              className={`conciliadas ${activeTab === 'conciliadas' ? 'active' : ''}`}
              onClick={() => handleChangeTab('conciliadas')}
            >
              Conciliadas
            </button>
          </div>

          {/* Barra de filtros */}
          <FilterBarConciliacao
            categorias={categorias}
            startDate={startDate}
            endDate={endDate}
            categoriaSelecionada={categoriaSelecionada}
            subTipoFiltro={subTipoFiltro}
            descricaoFiltro={descricaoFiltro}
            onFilterChange={handleFilterChange}
            isConciliadas={activeTab === 'conciliadas'}
          />


          <div className="content-tabs">
            {activeTab === 'pendentes' ? (
              <div className="transacoes-pendentes">
                {itensPaginados.length > 0 ? (
                  renderTransacoesPendentes()
                ) : (
                  <p>Nenhuma transação pendente para mostrar</p>
                )}
              </div>
            ) : (
              <div className="conciliadas-container">
                {itensPaginados.length > 0 ? (
                  renderTransacoesConciliadas()
                ) : (
                  <p>Nenhuma transação conciliada para mostrar</p>
                )}
              </div>
            )}
          </div>


          {/* Controle de paginação */}
          <div className="paginacao-container">
            <div className="paginacao-texto">
              <span>Transações por página:</span>
              <select
                value={itensPorPagina}
                onChange={(e) => {
                  const novosItensPorPagina = parseInt(e.target.value);
                  setItensPorPagina(novosItensPorPagina);
                  setTotalPaginas(Math.ceil(todasTransacoes.length / novosItensPorPagina));
                  paginarItens(todasTransacoes, 1, novosItensPorPagina);
                }}
                className="itens-por-pagina"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="paginacao-detalhes">
              <button
                onClick={handlePaginaAnterior}
                disabled={paginaAtual === 1}
                className="botao-paginacao"
              >
                <ArrowLeft className="seta-icon" />
              </button>
              <span>{`${paginaAtual} de ${totalPaginas}`}</span>
              <button
                onClick={handleProximaPagina}
                disabled={paginaAtual === totalPaginas}
                className="botao-paginacao"
              >
                <ArrowRight className="seta-icon" />
              </button>
            </div>
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
                  <img src={bancoLogos[contaSelecionada.codigoBanco] || bancoLogos['default']} alt="Banco Logo" className="banco-logo-conciliacao" />
                  <div>
                    <p>{contaSelecionada.nomeBanco}</p>
                    <p className='data'>{new Date(selectedTransacao?.dataTransacao).toLocaleDateString()}</p>
                  </div>
                </div>
                <h3 style={{ color: selectedTransacao.valor < 0 ? 'red' : 'green' }}>{`R$ ${selectedTransacao?.valor.toFixed(2)}`}</h3>
              </div>

              {/* Tabela de contas */}
              <div className="buscar-conta-tabela">
                <div className='container-button-add-conta'>
                  <h5>Buscar lançamento</h5>
                  <button onClick={() => {
                    setShowBuscarModal(false);
                    if (selectedTransacao.tipo === 'debito') {
                      setShowCriarContaPagarModal(true);
                    } else {
                      setShowCriarContaReceberModal(true);
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
                          .filter((conta) => conta.conciliacao.status !== 'conciliado')
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
                                  onChange={() => handleSelectContaConciliacao(conta)} // Usar handleSelectContaConciliacao aqui
                                />
                              </td>
                            </tr>
                          ))
                        : contasAReceber
                          .filter((conta) => conta.conciliacao.status !== 'conciliado')
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
                                  onChange={() => handleSelectContaConciliacao(conta)} // Usar handleSelectContaConciliacao aqui

                                />
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button className="conciliar-button" onClick={() => setShowConfirmationModal(true)}>
                Conciliar
              </button>
            </div>
          </Modal>
        )}

        {/* Renderização do modal de Conta a pagar */}
        {showCriarContaPagarModal && (
          <Modal
            isOpen={showCriarContaPagarModal}
            onClose={() => setShowCriarContaPagarModal(false)}
            title={contaAEditar ? "Editar conta a pagar" : "Nova conta a pagar"} // Título condicional
          >
            <form onSubmit={contaAEditar ? handleAtualizarContaPagar : handleCriarContaPagar}>
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

        {/* Renderização do modal de Conta a Receber */}
        {showCriarContaReceberModal && (
          <Modal
            isOpen={showCriarContaReceberModal}
            onClose={() => setShowCriarContaReceberModal(false)}
            title={contaAEditar ? "Editar conta a receber" : "Nova conta a receber"} // Título condicional
          >
            <form onSubmit={contaAEditar ? handleAtualizarContaReceber : handleCriarContaReceber}>
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
                  value={novaContaAReceber.clienteId}
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

        {/* Modal de Confirmação desfazer conciliação */}
        {showDesfazerModal && (
          <ConfirmationModal
            title="Desfazer Conciliação"
            message="Tem certeza que deseja realizar essa ação?"
            onConfirm={handleConfirmDesfazer}
            onCancel={() => setShowDesfazerModal(false)}
          />
        )}

        {/* Modal de confirmar conciliação manual */}
        {showConfirmationModal && (
          <ConfirmationModal
            title="Confirmar Conciliação"
            message={`Transação: Valor R$ ${selectedTransacao?.valor?.toFixed(2) || '0.00'} Vencimento: ${new Date(selectedTransacao?.dataTransacao).toLocaleDateString() || 'Data não disponível'}`}
            secondaryMessage={`Lançamento: Valor R$ ${selectedContaConciliacao?.valor?.toFixed(2) || '0.00'} Vencimento: ${new Date(selectedContaConciliacao?.vencimento).toLocaleDateString() || 'Data não disponível'}`}
            onConfirm={handleConfirmConciliacao}
            onCancel={() => setShowConfirmationModal(false)}
          />
        )}

        {/* Modal de aceitar conciliação sugerida */}
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
            title="Recusar Sugestão"
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
