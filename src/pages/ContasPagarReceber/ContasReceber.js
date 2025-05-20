import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import FilterBar from '../../components/FilterBar/FilterBar';
import Modal from '../../components/Modal/Modal';
import Notification from '../../components/Notification/Notification';
import './ContasPagarReceber.css';
import { AlertOctagon, ThumbsUp, XCircle, ChevronDown, ChevronUp, ArrowLeft, ArrowRight } from 'react-feather';
import { useFinance } from '../../context/FinanceContext';
import { useClientSupplier } from '../../context/ClientSupplierContext';
import { format, isValid, startOfMonth, endOfMonth } from 'date-fns';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import SearchBar from '../../components/SearchBar/SearchBar';
import { useNf } from '../../context/nfContext';
import ConfirmationModal from '../../components/Modal/confirmationModal';


const ContasReceber = () => {
  const { fetchClientes, clientes } = useClientSupplier();
  const { contasAReceber, fetchContasAReceber, addContaAReceber, updateContaAReceber, deleteContaAReceber, informRecebimento, desfazerRecebimento, categoriasAReceber, fetchCategoriasAReceber, exportarContasAReceber } = useFinance();
  const { fetchNfs, criarConciliacao, desfazerConciliacao } = useNf();
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [showConvenioModal, setShowConvenioModal] = useState(false);
  const [novaConta, setNovaConta] = useState({
    valor: '',
    vencimento: '',
    categoria: '',
    clienteId: '',
    descricao: '',
    tipoTransacao: '',
    status: 'A receber',
  });
  const [selectedConta, setSelectedConta] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: '',
    icon: null,
    buttons: [],
  });
  const [modalMode, setModalMode] = useState('add');
  const [recebimento, setRecebimento] = useState({
    recebidoEm: '',
    multa: '',
    juros: '',
    desconto: '',
  });
  const [expandSection, setExpandSection] = useState(false);
  const [filteredContasAReceber, setFilteredContasAReceber] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    categorias: [],
    status: [],
    clienteId: [],
    tipoTransacao: [],
    period: {
      start: null,
      end: null
    },
    month: null,
  });

  const [copiedPix, setCopiedPix] = useState(false);

  // --- Conciliacao NF state ---
  const [showConciliacaoModal, setShowConciliacaoModal] = useState(false);
  const [showTabelaNfModal, setShowTabelaNfModal] = useState(false);
  const [contaSelecionadaConciliacao, setContaSelecionadaConciliacao] = useState(null);
  const [nfsDisponiveis, setNfsDisponiveis] = useState([]);
  const [nfSelecionada, setNfSelecionada] = useState('');
  const [showConfirmDesconciliar, setShowConfirmDesconciliar] = useState(false);
  const [contaParaDesconciliar, setContaParaDesconciliar] = useState(null);
  // --- Conciliacao handlers ---
  // Novo fluxo de conciliação manual
  const handleAbrirConciliacao = async (conta) => {
    setContaSelecionadaConciliacao(conta);
    setShowConciliacaoModal(true); // Apenas confirmação inicial
    setNfSelecionada('');
  };

  // Confirmação inicial do modal
  const handleConfirmConciliacao = async () => {
    setShowConciliacaoModal(false);
    // Carrega NFs e abre tabela
    const nfs = await fetchNfs();
    const nfsNaoConciliadas = nfs.filter(nf => nf.conciliacaoStatus === 'naoConciliado');
    setNfsDisponiveis(nfsNaoConciliadas);
    setShowTabelaNfModal(true);
    setNfSelecionada('');
  };

  // Seleção de NF na tabela
  const handleSelecionarNf = (nfId) => {
    setNfSelecionada(nfId);
  };

  // Finalizar conciliação
  const handleConciliar = async () => {
    if (!nfSelecionada) return;
    await criarConciliacao({
      entidade: 'contaAReceber',
      entidadeId: contaSelecionadaConciliacao.id,
      nfId: parseInt(nfSelecionada)
    });
    setShowTabelaNfModal(false);
    setShowModal(false);
    fetchContasAReceber();
  };

  const handleDesconciliar = (conta) => {
    setContaParaDesconciliar(conta);
    setShowConfirmDesconciliar(true);
  };

  const confirmDesconciliar = async () => {
    if (!contaParaDesconciliar) return;
    await desfazerConciliacao(contaParaDesconciliar.nfId);
    setShowConfirmDesconciliar(false);
    setShowModal(false);
    fetchContasAReceber();
  };

  // Estados de paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [itensPaginados, setItensPaginados] = useState([]);

  // Buscar dados iniciais
  useEffect(() => {
    fetchContasAReceber();
    fetchCategoriasAReceber();
    fetchClientes();
  }, [fetchContasAReceber, fetchCategoriasAReceber, fetchClientes]);

  const filterContas = useCallback(() => {
    const { categorias = [], status = [], clienteId = [], period, month } = selectedFilters;
    const currentDate = new Date(); // Data atual

    // Calcular primeiro e último dia do mês atual
    const firstDayOfCurrentMonth = startOfMonth(currentDate);
    const lastDayOfCurrentMonth = endOfMonth(currentDate);

    const filtered = contasAReceber.filter((conta) => {
      const contaVencimento = new Date(conta.vencimento);

      // Verifica se a conta é do mês atual
      const isCurrentMonth =
        contaVencimento >= firstDayOfCurrentMonth &&
        contaVencimento <= lastDayOfCurrentMonth;

      // Lógica de exibição para quando um mês ou período é selecionado
      const matchesMonth =
        month &&
        contaVencimento >= startOfMonth(new Date(month)) &&
        contaVencimento <= endOfMonth(new Date(month));

      const matchesPeriod =
        period.start && period.end &&
        contaVencimento >= new Date(period.start) &&
        contaVencimento <= new Date(period.end);

      // Aplicar filtros por categoria, status e cliente
      const matchesCategoria = categorias.length === 0 || categorias.includes(conta.categoria);
      const matchesStatus = status.length === 0 || status.includes(conta.status.toLowerCase());
      const matchesCliente = clienteId.length === 0 || clienteId.includes(String(conta.cliente?.id));
      const matchesTipoTransacao = (!selectedFilters.tipoTransacao || selectedFilters.tipoTransacao.length === 0) ||
        selectedFilters.tipoTransacao.includes(conta.tipoTransacao);

      // Lógica para garantir que contas de meses diferentes não apareçam fora do contexto:
      return (
        (matchesPeriod || matchesMonth || (!month && !period.start && !period.end && isCurrentMonth)) &&
        matchesCategoria &&
        matchesStatus &&
        matchesCliente &&
        matchesTipoTransacao
      );
    });

    // Ordenar vencidas do mês atual no topo, depois por data
    const sortedFiltered = filtered.sort((a, b) => {
      const isAOverdue = a.status.toLowerCase() === 'vencido';
      const isBOverdue = b.status.toLowerCase() === 'vencido';

      if (isAOverdue && !isBOverdue) return -1;
      if (!isAOverdue && isBOverdue) return 1;

      return new Date(a.vencimento) - new Date(b.vencimento);
    });

    setFilteredContasAReceber(sortedFiltered);
  }, [contasAReceber, selectedFilters]);

  // Atualizar contas a receber filtradas quando contasAReceber ou filtros mudarem
  useEffect(() => {
    if (contasAReceber && Array.isArray(contasAReceber)) {
      filterContas();
    }
  }, [contasAReceber, selectedFilters, filterContas]);


  useEffect(() => {
    setTotalPaginas(Math.ceil(filteredContasAReceber.length / itensPorPagina));
    paginarItens(filteredContasAReceber, 1, itensPorPagina);
  }, [filteredContasAReceber, itensPorPagina]);

  const handleFilterChange = (e) => {
    const { name, value, checked } = e.target;

    setSelectedFilters((prevFilters) => {
      let updatedFilters = { ...prevFilters };

      if (name === 'resetFilters') {
        return value; // Reseta os filtros para os valores padrão
      }

      if (!updatedFilters.categorias) updatedFilters.categorias = [];
      if (!updatedFilters.status) updatedFilters.status = [];
      if (!updatedFilters.clienteId) updatedFilters.clienteId = [];
      if (!updatedFilters.tipoTransacao) updatedFilters.tipoTransacao = [];

      if (name === 'categoria') {
        updatedFilters.categorias = checked
          ? [...new Set([...updatedFilters.categorias, value])]
          : updatedFilters.categorias.filter((cat) => cat !== value);
      } else if (name === 'status') {
        updatedFilters.status = checked
          ? [...new Set([...updatedFilters.status, value])]
          : updatedFilters.status.filter((stat) => stat !== value);
      } else if (name === 'cliente') {
        updatedFilters.clienteId = checked
          ? [...new Set([...updatedFilters.clienteId, value])]
          : updatedFilters.clienteId.filter((id) => id !== value);
      } else if (name === 'tipoTransacao') {
        updatedFilters.tipoTransacao = checked
          ? [...new Set([...updatedFilters.tipoTransacao, value])]
          : updatedFilters.tipoTransacao.filter((tipo) => tipo !== value);
      } else if (name === 'periodStart' || name === 'periodEnd') {
        updatedFilters.period = {
          ...updatedFilters.period,
          [name === 'periodStart' ? 'start' : 'end']: value,
        };
        updatedFilters.month = null;
      } else if (name === 'month') {
        updatedFilters.month = value;
        updatedFilters.period = { start: null, end: null };
      }

      return updatedFilters;
    });
  };

  // Função de busca com restauração de estado usando filteredContasAReceber
  const handleSearch = (searchTerm) => {
    const normalizedSearchTerm = searchTerm.replace(/[^0-9.]/g, '');

    if (!normalizedSearchTerm) {
      // Quando o campo está vazio, use o estado filtrado atual
      filterContas(); // Reaplica os filtros para restaurar `filteredContasAReceber`
      return;
    }

    // Filtragem normal quando há um termo de busca
    const filtered = filteredContasAReceber.filter(conta => {
      const valorConta = conta.valor.toString();
      return valorConta.includes(normalizedSearchTerm);
    });

    setFilteredContasAReceber(filtered);
  };

  // Formatar data para 'yyyy-MM-dd'
  const formatDate = (dateString) => {
    if (!dateString) return 'Data inválida';
    const date = new Date(dateString); // já está em ISO completo
    if (!isValid(date)) return 'Data inválida';

    // Ajuste manual do timezone (UTC -> local)
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return format(adjustedDate, 'dd-MM-yyyy');
  };

  // Formatar valor para o formato de moeda
  const formatValue = (value) => {
    if (!value) return '0,00';
    const formatted = parseFloat(value).toFixed(2).toString().replace('.', ',');
    return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Alternar a visibilidade do tooltip de ações
  const handleActionsClick = (id) => {
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  // Abrir modal para adicionar uma nova conta
  const handleAdd = () => {
    setModalMode('add');
    setNovaConta({
      valor: '',
      vencimento: '',
      categoria: '',
      clienteId: '',
      descricao: '',
      status: 'A receber'
    });
    setShowModal(true);
  };

  // Abrir modal para editar uma conta existente
  const handleEdit = (conta) => {
    setModalMode('edit');
    setNovaConta({
      ...conta,
      vencimento: new Date(new Date(conta.vencimento).getTime() + new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0],
      valor: formatValue(conta.valor),
      clienteId: conta.cliente?.id ? Number(conta.cliente.id) : '',
    });
    setShowModal(true);
  };

  // Abrir modal para visualizar uma conta existente
  const handleView = (conta) => {
    setModalMode('view');
    setNovaConta({
      ...conta,
      vencimento: new Date(new Date(conta.vencimento).getTime() + new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0],
      valor: formatValue(conta.valor),
    });
    setShowModal(true);
  };

  // Abrir modal para excluir uma conta
  const handleDelete = (conta) => {
    setSelectedConta(conta);
    setShowDeleteModal(true);
  };

  // Abrir modal para confirmar recebimento
  const handleConfirm = (conta) => {
    if (conta.status === 'recebido') {
      setSelectedConta(conta);
      setShowUndoModal(true);
    } else {
      setSelectedConta({
        ...conta,
        valorOriginal: conta.valor,
      });
      setRecebimento({
        recebidoEm: '',
        multa: '',
        juros: '',
        desconto: '',
        tipoTransacao: conta.tipoTransacao || '',
      });
      setExpandSection(false);
      setShowConfirmModal(true);
    }
  };

  // Lidar com mudanças de entrada no formulário de nova/edição de conta
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNovaConta(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (name === 'criarCobranca' ? (checked ? 'Sim' : '') : (checked ? 'Recebido' : 'A receber'))
        : value
    }));
  };

  // Lidar com mudanças de entrada no formulário de recebimento
  const handleRecebimentoChange = (e) => {
    const { name, value } = e.target;
    setRecebimento({ ...recebimento, [name]: value });
  };

  // Calcular valor total incluindo taxas e descontos
  const calcularValorTotal = () => {
    const parseCurrency = (value) => parseFloat(value.toString().replace(',', '.')) || 0;

    const valorOriginal = parseCurrency(selectedConta?.valor);
    const multa = parseCurrency(recebimento.multa);
    const juros = parseCurrency(recebimento.juros);
    const desconto = parseCurrency(recebimento.desconto);

    const valorTotal = valorOriginal + multa + juros - desconto;

    return valorTotal.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calcular totais para os status 'a receber' e 'recebido'
  const calcularTotais = () => {
    let totalAReceber = 0;
    let totalRecebido = 0;

    filteredContasAReceber.forEach(conta => {
      const valor = parseFloat(conta.valor) || 0;
      if (conta.status === 'aReceber' || conta.status === 'vencido') {
        totalAReceber += valor;
      } else if (conta.status === 'recebido') {
        totalRecebido += valor;
      }
    });

    const totalReceitas = totalAReceber + totalRecebido;

    return {
      totalAReceber: totalAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalRecebido: totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalReceitas: totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    };
  };

  const { totalAReceber, totalRecebido, totalReceitas } = calcularTotais();

  // Estado para loading do submit
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  // Lidar com a submissão do formulário para adicionar/editar contas
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    // Extrair apenas os campos permitidos
    const contaToSave = {
      valor: parseFloat(novaConta.valor.replace(',', '.')),
      vencimento: novaConta.vencimento,
      categoria: novaConta.categoria,
      clienteId: Number(novaConta.clienteId),
      ...(novaConta.descricao && { descricao: novaConta.descricao }),
      ...(novaConta.criarCobranca === 'Sim' && { criarCobranca: true }),
    };

    if (novaConta.status === 'Recebido' && novaConta.tipoTransacao) {
      contaToSave.tipoTransacao = novaConta.tipoTransacao;
    }

    try {
      if (modalMode === 'edit') {
        await updateContaAReceber(novaConta.id, contaToSave);
      } else {
        await addContaAReceber(contaToSave);
      }
      setShowModal(false);
      fetchContasAReceber();
      setLoadingSubmit(false);
    } catch (error) {
      setNotificationData({
        title: 'Erro',
        message: error.response?.data?.message || 'Erro ao salvar conta a receber.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
      console.error('Erro ao salvar conta a receber', error);
      setLoadingSubmit(false);
    }
  };

  // Lidar com a confirmação de recebimento
  const confirmRecebimento = async () => {
    if (!recebimento.recebidoEm) {
      setNotificationData({
        title: 'Erro',
        message: 'Por favor, preencha a data de recebimento.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
      return;
    }

    try {
      const updatedConta = {
        recebidoEm: recebimento.recebidoEm,
        multa: recebimento.multa ? parseFloat(recebimento.multa) : undefined,
        juros: recebimento.juros ? parseFloat(recebimento.juros) : undefined,
        desconto: recebimento.desconto ? parseFloat(recebimento.desconto) : undefined,
      };

      if (recebimento.tipoTransacao) {
        updatedConta.tipoTransacao = recebimento.tipoTransacao;
      }

      await informRecebimento(selectedConta.id, updatedConta);

      setShowConfirmModal(false);
      fetchContasAReceber();
    } catch (error) {
      setNotificationData({
        title: 'Erro',
        message: error.response?.data?.message || 'Erro ao informar recebimento.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
      console.error('Erro ao informar recebimento', error);
    }
  };

  // Lidar com a desfazer recebimento
  const confirmUndoRecebimento = async () => {
    try {
      const updatedConta = {
        ...selectedConta,
        status: 'aReceber',
        valor: selectedConta.valorOriginal,
        recebidoEm: null,
        multa: null,
        juros: null,
        desconto: null
      };
      await desfazerRecebimento(selectedConta.id, updatedConta);
      setShowUndoModal(false);
      fetchContasAReceber();
    } catch (error) {
      setShowNotification(true);
      console.error('Erro ao desfazer recebimento', error);
    }
  };

  // Lidar com a exclusão de conta
  const confirmDelete = async () => {
    try {
      await deleteContaAReceber(selectedConta.id);
      setShowDeleteModal(false);
      fetchContasAReceber();
    } catch (error) {
      setNotificationData({
        title: 'Erro',
        message: error.response?.data?.message || 'Erro ao remover conta a receber.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
      console.error('Erro ao remover conta a receber', error);
    }
  };


  // convenios BB
  // Abrir modal para excluir uma conta
  const handleConvenio = (conta) => {
    setSelectedConta(conta);
    setShowConvenioModal(true);
  };

  // função para exportar conta
  const handleExport = async () => {
    const { categorias, status, clienteId, period, month } = selectedFilters;

    // Obter o mês atual como padrão se nenhum filtro for fornecido
    const currentMonth = new Date();
    const defaultStart = startOfMonth(currentMonth);
    const defaultEnd = endOfMonth(currentMonth);

    // Preparar o período no novo formato esperado
    const periodo = period.start && period.end
      ? `vencimento:${formatDate(period.start)}|${formatDate(period.end)}`
      : month
        ? `vencimento:${format(startOfMonth(new Date(month)), 'yyyy-MM-dd')}|${format(endOfMonth(new Date(month)), 'yyyy-MM-dd')}`
        : `vencimento:${format(defaultStart, 'yyyy-MM-dd')}|${format(defaultEnd, 'yyyy-MM-dd')}`; // Padrão para o mês atual

    // Construir o filtro adicional, se necessário
    let filtro = [];
    if (categorias.length > 0) {
      filtro.push(`categoria:${categorias.join(',')}`);
    }
    if (status.length > 0) {
      filtro.push(`status:${status.join(',')}`);
    }
    if (clienteId.length > 0) {
      filtro.push(`cliente:${clienteId.join(',')}`);
    }

    // Configurar os filtros para a requisição
    const filtros = {
      itensPorPagina: 20000000,
      pagina: 1,
      ...(filtro.length > 0 && { filtro: filtro.join(',') }),
      periodo,
    };

    console.log('Filtros para exportação:', filtros);

    try {
      const data = await exportarContasAReceber(filtros);

      // Criar e baixar o arquivo Excel
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'contas-a-receber.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Exibir notificação de sucesso
      setNotificationData({
        title: 'Exportação Concluída',
        message: 'As contas a receber foram exportadas com sucesso!',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      setNotificationData({
        title: 'Erro',
        message: error.message || 'Falha ao exportar contas a receber.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
    }
  };


  // Função para paginar itens
  const paginarItens = (itens, pagina, itensPorPagina) => {
    const inicio = (pagina - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const paginados = itens.slice(inicio, fim);
    setItensPaginados(paginados);
  };

  // Funções para lidar com a paginação
  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      const novaPagina = paginaAtual + 1;
      setPaginaAtual(novaPagina);
      paginarItens(filteredContasAReceber, novaPagina, itensPorPagina);
    }
  };

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) {
      const novaPagina = paginaAtual - 1;
      setPaginaAtual(novaPagina);
      paginarItens(filteredContasAReceber, novaPagina, itensPorPagina);
    }
  };

  // função pra transformar os tipos de transação
  const formatTipoTransacao = (value) => {
    const map = {
      pix: 'PIX',
      boleto: 'Boleto',
      transferencia: 'Transferência',
      compraNoDebito: 'Compra no Débito',
      pagamentoFaturaCartao: 'Pagamento de Fatura',
      recargaCelular: 'Recarga de Celular',
      outro: 'Outro',
    };

    return map[value] || value;
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />

        <FilterBar
          onAdd={handleAdd}
          titleButton='Conta a receber'
          filterConfig={{
            categoria: true,
            status: true,
            cliente: true,
            exibirFaturas: true,
            buttonAdd: true,
            buttonPeriod: true,
            buttonMeses: true,
            tipoTransacao: []
          }}
          categorias={categoriasAReceber}
          clientes={clientes}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          showExportButton={true}
          onExport={handleExport}
        />


        <div className='content content-table'>
          <h1 className='h1-search'>Contas a receber <SearchBar onSearch={handleSearch} placeholder='Pesquisa pelo valor' /></h1>
          <table className="table">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Categoria</th>
                <th>Origem</th>
                <th>Cliente</th>
                <th>CPF/CNPJ</th>
                <th>Tipo transação</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Ações</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itensPaginados.length > 0 ? (
                itensPaginados.map((conta, index) => (
                  <tr key={index}>
                    <td data-label="Vencimento">{formatDate(conta.vencimento)}</td>
                    <td data-label="Categoria">
                      {conta.categoria} <span className="nf-badge">{`NF ${conta.nf ? conta.nf.nNF : 'N/A'}`}</span>
                    </td>
                    <td data-label="Origem">{conta.tipoCadastro.charAt(0).toUpperCase() + conta.tipoCadastro.slice(1)}</td>
                    <td data-label="Cliente">{conta.cliente ? conta.cliente.nomeFantasia : 'Cliente não encontrado'}</td>
                    <td data-label="Descrição">{conta.cliente.cpfCnpj}</td>
                    <td data-label="Tipo Transação">{formatTipoTransacao(conta.tipoTransacao)}</td>
                    <td data-label="Status">
                      <span className={`status ${conta.status.toLowerCase().replace(' ', '-')}`}>{conta.status === 'aReceber' ? 'a receber' : conta.status}</span>
                    </td>
                    <td data-label="Valor">R${formatValue(conta.valor)}</td>
                    <td data-label="Ações" className="actions">
                      <button onClick={() => handleActionsClick(index)}>...</button>
                      {activeTooltip === index && (
                        <div className="tooltip">
                          <ul>
                            <li onClick={() => handleEdit(conta)}>Editar</li>
                            <li onClick={() => handleView(conta)}>Visualizar</li>
                            <li onClick={() => handleDelete(conta)} className="remove">Remover</li>
                            {conta.cobrancaBb && (
                              <li onClick={() => handleConvenio(conta)}>Cobrança BB</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </td>
                    <td onClick={() => handleConfirm(conta)} className={`svg-like ${conta.status === 'recebido' ? 'received' : conta.status === 'vencido' ? 'overdue' : ''}`}>
                      <ThumbsUp />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='8'>Nenhum dado a ser mostrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Controle de paginação */}
        <div className="paginacao-container">
          <div className="paginacao-texto">
            <span>Contas por página:</span>
            <select
              value={itensPorPagina}
              onChange={(e) => {
                const novosItensPorPagina = parseInt(e.target.value);
                setItensPorPagina(novosItensPorPagina);
                setTotalPaginas(Math.ceil(filteredContasAReceber.length / novosItensPorPagina));
                paginarItens(filteredContasAReceber, 1, novosItensPorPagina);
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

        {/* Soma totais */}
        <div className="totais-section">
          <div className="total-item">
            <span>A receber:</span>
            <span>R${totalAReceber}</span>
          </div>
          <div className="total-item">
            <span>Recebido:</span>
            <span>R${totalRecebido}</span>
          </div>
          <div className="total-item">
            <span>Total de receitas:</span>
            <span>R${totalReceitas}</span>
          </div>
        </div>
      </div>

      {/* Modal de cadastrar/editar conta */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={modalMode === 'view' ? 'Visualizar conta a receber' : (modalMode === 'edit' ? 'Editar conta a receber' : 'Nova conta a receber')}>
        <form onSubmit={handleSubmit}>
          {modalMode === 'edit' && (
            <div className="delete-warnings">
              <p className='warnig-conta'><AlertOctagon /> A edição dessa fatura não altera a nota fiscal emitida.</p>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="valor">Valor</label>
            <div className='div-sifrao'>
              <span>R$</span>
              <FormattedInput type="valor" id="valor" name="valor" value={novaConta.valor} onChange={handleChange} placeholder={'0.000,00'} required disabled={modalMode === 'view'} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="vencimento">Vencimento</label>
            <input type="date" id="vencimento" name="vencimento" value={novaConta.vencimento} onChange={handleChange} required placeholder="dd/mm/aaaa" disabled={modalMode === 'view'} />
          </div>
          <div className="form-group">
            <label htmlFor="categoria">Categoria</label>
            <select id="categoria" name="categoria" value={novaConta.categoria} onChange={handleChange} required disabled={modalMode === 'view'}>
              <option value="">Selecione uma categoria</option>
              {categoriasAReceber.map((categoria, index) => (
                <option key={index} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="clienteId">Cliente</label>
            <select id="clienteId" name="clienteId" value={novaConta.clienteId} onChange={handleChange} required disabled={modalMode === 'view'}>
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente, index) => (
                <option key={index} value={cliente.id}>{cliente.nomeFantasia}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="descricao">Descrição (Opcional)</label>
            <input type="text" id="descricao" name="descricao" value={novaConta.descricao} onChange={handleChange} disabled={modalMode === 'view'} />
          </div>
          {(modalMode !== 'edit' && modalMode !== 'view') && (
            <>
              <div className="form-group">
                <input type="checkbox" id="criarCobranca" name="criarCobranca" checked={novaConta.criarCobranca === 'Sim'} onChange={handleChange} />
                <label htmlFor="criarCobranca">Criar cobrança BB</label>
              </div>
              {!novaConta.criarCobranca && (
                <div className="form-group">
                  <input type="checkbox" id="recebido" name="status" checked={novaConta.status === 'Recebido'} onChange={handleChange} />
                  <label htmlFor="recebido">Marcar como recebido</label>
                </div>
              )}
            </>
          )}

          {novaConta.status === 'Recebido' && (
            <div className="form-group">
              <label htmlFor="tipoTransacao">Tipo de transação</label>
              <select
                id="tipoTransacao"
                name="tipoTransacao"
                value={novaConta.tipoTransacao}
                onChange={handleChange}
                required
              >
                <option value="">Selecione</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência</option>
                <option value="compraNoDebito">Compra no Débito</option>
                <option value="pagamentoFaturaCartao">Pagamento de Fatura</option>
                <option value="recargaCelular">Recarga de Celular</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          )}
          {modalMode === 'view' && (
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <input type="text" id="status" name="status" value={novaConta.status} onChange={handleChange} disabled={modalMode === 'view'} />
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="cancel" onClick={() => setShowModal(false)}>Cancelar</button>
            {modalMode !== 'view' && (
              <button type="submit" className="save" disabled={loadingSubmit}>
                {loadingSubmit ? 'Salvando...' : 'Salvar'}
              </button>
            )}
            {/* Botões de conciliação/desfazer conciliação no modal de edição */}
            {modalMode === 'edit' && !novaConta.nfId && (
              <button style={{ marginLeft: 10 }} type="button" className="flag-button" onClick={() => handleAbrirConciliacao(novaConta)}>
                Criar conciliação com NF
              </button>
            )}
            {modalMode === 'edit' && novaConta.nfId && (
              <button style={{ marginLeft: 10 }} type="button" className="flag-button" onClick={() => handleDesconciliar(novaConta)}>
                Desfazer conciliação com NF
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* Modal de excluir conta */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Remover conta a receber">
        <div className="delete-modal-content">
          <div className="delete-info">
            <div>
              <span>{formatDate(selectedConta?.vencimento)}</span>
              <span>{selectedConta?.categoria}</span>
            </div>
            <span>R${formatValue(selectedConta?.valor)}</span>
          </div>
          <div className="delete-warnings">
            <p className='warnig-conta'><AlertOctagon /> Para haver validade fiscal/contábil é necessário remover também a NF atrelada a essa conta a receber.</p>
            <p className="error-conta"><XCircle /> Não podemos remover essa conta a receber. Essa despesa foi conciliada com uma transação bancária. Para excluí-la é necessário desfazer a conciliação.</p>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
            <button type="button" className="save" onClick={confirmDelete}>Ok</button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmar recebimento */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirmar o recebimento">
        <div className="confirm-modal-content">
          <div className="confirm-info">
            <div>
              <span>{formatDate(selectedConta?.vencimento)}</span>
              <span>{selectedConta?.categoria}</span>
            </div>
            <span>R${formatValue(selectedConta?.valor)}</span>
          </div>
          <div className="form-group">
            <label htmlFor="tipoTransacao">Tipo de transação</label>
            <select
              id="tipoTransacao"
              name="tipoTransacao"
              value={recebimento.tipoTransacao || ''}
              onChange={handleRecebimentoChange}
              required
            >
              <option value="">Selecione</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
              <option value="transferencia">Transferência</option>
              <option value="compraNoDebito">Compra no Débito</option>
              <option value="pagamentoFaturaCartao">Pagamento de Fatura</option>
              <option value="recargaCelular">Recarga de Celular</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="recebidoEm">Data do recebimento</label>
            <input
              type="date"
              id="recebidoEm"
              name="recebidoEm"
              value={recebimento.recebidoEm}
              onChange={handleRecebimentoChange}
              required
              placeholder="dd/mm/aaaa"
            />
          </div>
          <div className="form-group">
            <h5 onClick={() => setExpandSection(!expandSection)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              Incluir multas, juros ou descontos {expandSection ? <ChevronUp /> : <ChevronDown />}
            </h5>
            {expandSection && (
              <div className="expandable-section">
                <div className="form-group-modal">
                  <div className="form-group">
                    <label htmlFor="multa">Multa</label>
                    <div className='div-sifrao'>
                      <span>R$</span>
                      <FormattedInput placeholder={"0,00"} type="valor" id="multa" name="multa" value={recebimento.multa} onChange={handleRecebimentoChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="juros">Juros</label>
                    <div className='div-sifrao'>
                      <span>R$</span>
                      <FormattedInput placeholder={"0,00"} type="valor" id="juros" name="juros" value={recebimento.juros} onChange={handleRecebimentoChange} />
                    </div>
                  </div>
                </div>
                <div className="form-group-modal">
                  <div className="form-group">
                    <label htmlFor="desconto">Desconto</label>
                    <div className='div-sifrao'>
                      <span>R$</span>
                      <FormattedInput placeholder={"0,00"} type="valor" id="desconto" name="desconto" value={recebimento.desconto} onChange={handleRecebimentoChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="valorTotal">Valor total</label>
                    <div className='div-sifrao'>
                      <span>R$</span>
                      <FormattedInput type="valor" id="valorTotal" name="valorTotal" value={calcularValorTotal()} readOnly />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="cancel" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
            <button type="button" className="save" onClick={confirmRecebimento}>Marcar como recebido</button>
          </div>
        </div>
      </Modal>

      {/* Modal de desfazer recebimento */}
      <Modal isOpen={showUndoModal} onClose={() => setShowUndoModal(false)} title="Confirmação">
        <div className="undo-modal-content">
          <div className="confirm-info">
            <div>
              <span>{formatDate(selectedConta?.vencimento)}</span>
              <span>{selectedConta?.categoria}</span>
            </div>
            <span>R${formatValue(selectedConta?.valor)}</span>
          </div>
          <br></br>
          <div className="undo-confirmation">
            <p style={{ fontSize: '14px' }}>Confirma que deseja desfazer o recebimento da conta acima?</p>
          </div>
          <br></br>
          <div className="form-actions">
            <button type="button" className="cancel" onClick={() => setShowUndoModal(false)}>Cancelar</button>
            <button type="button" className="save" onClick={confirmUndoRecebimento} style={{ backgroundColor: 'red', color: 'white' }}>Desfazer recebimento</button>
          </div>
        </div>
      </Modal>

      {/* Modal de conciliação NF - confirmação inicial */}
      <Modal
        isOpen={showConciliacaoModal}
        onClose={() => setShowConciliacaoModal(false)}
        title="Confirmar conciliação com NF"
      >
        <div style={{ margin: '16px 0' }}>
          <p>
            Você está criando uma conciliação de conta a receber com uma NF que será escolhida, tem certeza que deseja realizar esta ação?
          </p>
        </div>
        <div className="form-actions">
          <button type="button" className="cancel" onClick={() => setShowConciliacaoModal(false)}>Não tenho certeza</button>
          <button type="button" className="save" onClick={handleConfirmConciliacao}>Tenho certeza</button>
        </div>
      </Modal>

      {/* Modal de tabela de NFs disponíveis para conciliação */}
      <Modal
        isOpen={showTabelaNfModal}
        onClose={() => setShowTabelaNfModal(false)}
        title="Escolha a NF para conciliar"
        size="large"
      >
        <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nº/Série</th>
                <th>Emissão</th>
                <th>Cliente</th>
                <th>Situação</th>
                <th>Valor</th>
                <th>Selecionar</th>
              </tr>
            </thead>
            <tbody>
              {nfsDisponiveis.length === 0 ? (
                <tr>
                  <td colSpan={6}>Nenhuma NF disponível</td>
                </tr>
              ) : (
                nfsDisponiveis.map(nf => (
                  <tr key={nf.id}>
                    <td>{nf.nNF}{nf.serie ? `/${nf.serie}` : ''}</td>
                    <td>{nf.dhEmi ? formatDate(nf.dhEmi) : ''}</td>
                    <td>{nf.destXNome}</td>
                    <td>{nf.situacao || 'Emitida'}</td>
                    <td>R${formatValue(nf.valorTotal)}</td>
                    <td>
                      <button
                        type="button"
                        className={nfSelecionada === nf.id ? 'save' : 'flag-button'}
                        onClick={() => handleSelecionarNf(nf.id)}
                        style={{ minWidth: 90 }}
                      >
                        {nfSelecionada === nf.id ? 'Selecionado' : 'Selecionar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="cancel" onClick={() => setShowTabelaNfModal(false)}>Cancelar</button>
          <button
            type="button"
            className="save"
            disabled={!nfSelecionada}
            onClick={handleConciliar}
          >
            Conciliar
          </button>
        </div>
      </Modal>

      {/* Modal de desfazer convgenio BB */}
      <Modal isOpen={showConvenioModal} onClose={() => setShowConvenioModal(false)} title="Cobrança BB">
        <div className="boleto-info">
          <div className="form-group">
            <label>Linha Digitável</label>
            <input
              type="text"
              value={selectedConta?.cobrancaBb?.linhaDigitavel || '---'}
              readOnly
              onClick={() => {
                navigator.clipboard.writeText(selectedConta?.cobrancaBb?.linhaDigitavel || '');
                setCopiedPix(true);
                setTimeout(() => setCopiedPix(false), 1500);
              }}
              style={{ cursor: 'pointer' }}
              title="Clique para copiar"
            />
            {copiedPix && <small style={{ color: 'green' }}>Copiado!</small>}
          </div>
          <div className="form-group">
            <label>Nosso Número</label>
            <input type="text" value={selectedConta?.cobrancaBb?.nossoNumero || '---'} readOnly />
          </div>
          <div className="form-group">
            <label>Número do Boleto</label>
            <input type="text" value={selectedConta?.cobrancaBb?.numero || '---'} readOnly />
          </div>
          <div className="form-group">
            <label>PIX (COPIA e COLA)</label>
            <textarea
              style={{ resize: 'none', width: '100%', height: '100px', cursor: 'pointer' }}
              value={selectedConta?.cobrancaBb?.pixEmv || '---'}
              readOnly
              onClick={() => {
                navigator.clipboard.writeText(selectedConta?.cobrancaBb?.pixEmv || '');
                setCopiedPix(true);
                setTimeout(() => setCopiedPix(false), 1500);
              }}
              title="Clique para copiar"
            />
            {copiedPix && <small style={{ color: 'green' }}>Copiado!</small>}
          </div>
          <div className="form-group">
            <label>Vencimento</label>
            <input type="text" value={formatDate(selectedConta?.cobrancaBb?.vencimento) || '---'} readOnly />
          </div>
          <div className="form-group">
            <label>Status</label>
            <input type="text" value={selectedConta?.cobrancaBb?.status || '---'} readOnly />
          </div>
          <div className="form-group">
            <label>Visualizar Boleto </label>
            <a
              href={selectedConta?.cobrancaBb?.urlImagemBoleto}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
               Abrir boleto em nova aba
            </a>
          </div>
        </div>
      </Modal>

      {showNotification && (
        <Notification
          title={notificationData.title}
          message={notificationData.message}
          type={notificationData.type}
          icon={notificationData.icon}
          buttons={notificationData.buttons}
          onClose={() => setShowNotification(false)}
        />
      )}

      {showConfirmDesconciliar && (
        <ConfirmationModal
          title="Confirmar desfazer conciliação"
          message="Você está desfazendo a conciliação com uma NF, tem certeza que deseja realizar esta ação?"
          onConfirm={confirmDesconciliar}
          onCancel={() => setShowConfirmDesconciliar(false)}
        />
      )}
    </div >
  );
};

export default ContasReceber;
