import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import FilterBar from '../../components/FilterBar/FilterBar';
import Modal from '../../components/Modal/Modal';
import Notification from '../../components/Notification/Notification';
import ConfirmationModal from '../../components/Modal/confirmationModal';
import './ContasPagarReceber.css';
import { AlertOctagon, ThumbsUp, XCircle, ChevronDown, ChevronUp, ArrowLeft, ArrowRight } from 'react-feather';
import { useFinance } from '../../context/FinanceContext';
import { useClientSupplier } from '../../context/ClientSupplierContext';
import { format, isValid, startOfMonth, endOfMonth } from 'date-fns';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import SearchBar from '../../components/SearchBar/SearchBar';

import { useNf } from '../../context/nfContext';


const ContasAPagar = () => {
  const { fetchFornecedores, fornecedores } = useClientSupplier();
  const { contasAPagar, fetchContasAPagar, addContaAPagar, updateContaAPagar, deleteContaAPagar, informPagamento, desfazerPagamento, categorias, fetchCategorias, exportarContasAPagar } = useFinance();
  const { fetchNfs, criarConciliacao, desfazerConciliacao } = useNf();
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [novaConta, setNovaConta] = useState({
    valor: '',
    vencimento: '',
    categoria: '',
    fornecedorId: '',
    descricao: '',
    tipoTransacao: '',
    estaPago: false
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
  const [pagamento, setPagamento] = useState({
    pagoEm: '',
    multa: '',
    juros: '',
    desconto: '',
  });
  const [expandSection, setExpandSection] = useState(false);
  const [filteredContasAPagar, setFilteredContasAPagar] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    categorias: [],
    status2: [],
    fornecedorId: [],
    tipoTransacao: [],
    period: {
      start: null,
      end: null
    },
    month: null,
  });

  // --- Conciliacao NF state ---
  const [showConciliacaoModal, setShowConciliacaoModal] = useState(false);
  const [showTabelaNfModal, setShowTabelaNfModal] = useState(false);
  const [contaSelecionadaConciliacao, setContaSelecionadaConciliacao] = useState(null);
  const [nfsDisponiveis, setNfsDisponiveis] = useState([]);
  const [nfSelecionada, setNfSelecionada] = useState('');
  // --- Conciliacao NF state ---
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
      entidade: 'contaAPagar',
      entidadeId: contaSelecionadaConciliacao.id,
      nfId: parseInt(nfSelecionada)
    });
    setShowTabelaNfModal(false);
    setShowModal(false);
    fetchContasAPagar();
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
    fetchContasAPagar();
  };


  // Estados de paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [itensPaginados, setItensPaginados] = useState([]);


  // Buscar dados iniciais
  useEffect(() => {
    fetchContasAPagar();
    fetchCategorias();
    fetchFornecedores();
  }, [fetchContasAPagar, fetchCategorias, fetchFornecedores]);

  const filterContas = useCallback(() => {
    const { categorias = [], status2 = [], fornecedorId = [], period, month } = selectedFilters;
    const currentDate = new Date(); // Data atual

    const firstDayOfCurrentMonth = startOfMonth(currentDate);
    const lastDayOfCurrentMonth = endOfMonth(currentDate);

    const filtered = contasAPagar.filter((conta) => {
      const contaVencimento = new Date(conta.vencimento);

      const isCurrentMonth =
        contaVencimento >= firstDayOfCurrentMonth &&
        contaVencimento <= lastDayOfCurrentMonth;

      const matchesMonth =
        month &&
        contaVencimento >= startOfMonth(new Date(month)) &&
        contaVencimento <= endOfMonth(new Date(month));

      const matchesPeriod =
        period.start && period.end &&
        contaVencimento >= new Date(period.start) &&
        contaVencimento <= new Date(period.end);

      const matchesCategoria = categorias.length === 0 || categorias.includes(conta.categoria);
      const matchesStatus = status2.length === 0 || status2.includes(conta.status.toLowerCase());
      const matchesFornecedor = fornecedorId.length === 0 || fornecedorId.includes(String(conta.fornecedor?.id));
      const matchesTipoTransacao = (!selectedFilters.tipoTransacao || selectedFilters.tipoTransacao.length === 0) ||
        selectedFilters.tipoTransacao.includes(conta.tipoTransacao);
      return (
        (matchesPeriod || matchesMonth || (!month && !period.start && !period.end && isCurrentMonth)) &&
        matchesCategoria &&
        matchesStatus &&
        matchesFornecedor &&
        matchesTipoTransacao
      );
    });

    const sortedFiltered = filtered.sort((a, b) => {
      const isAOverdue = a.status.toLowerCase() === 'vencido';
      const isBOverdue = b.status.toLowerCase() === 'vencido';

      if (isAOverdue && !isBOverdue) return -1;
      if (!isAOverdue && isBOverdue) return 1;

      return new Date(a.vencimento) - new Date(b.vencimento);
    });

    setFilteredContasAPagar(sortedFiltered);
  }, [contasAPagar, selectedFilters]);


  // Atualizar contas a pagar filtradas quando contasAPagar ou filtros mudarem
  useEffect(() => {
    if (contasAPagar && Array.isArray(contasAPagar)) {
      filterContas();
    }
  }, [contasAPagar, selectedFilters, filterContas]);

  useEffect(() => {
    setTotalPaginas(Math.ceil(filteredContasAPagar.length / itensPorPagina));
    paginarItens(filteredContasAPagar, 1, itensPorPagina);
  }, [filteredContasAPagar, itensPorPagina]);

  const handleFilterChange = (e) => {
    const { name, value, checked } = e.target;

    setSelectedFilters((prevFilters) => {
      // Se o nome do filtro for reset, retorna os valores padrão
      if (name === 'resetFilters') {
        return value;
      }

      let updatedFilters = { ...prevFilters };

      if (!updatedFilters.categorias) updatedFilters.categorias = [];
      if (!updatedFilters.status2) updatedFilters.status2 = [];
      if (!updatedFilters.fornecedorId) updatedFilters.fornecedorId = [];
      if (!updatedFilters.subTipo) updatedFilters.subTipo = [];

      if (name === 'categoria') {
        updatedFilters.categorias = checked
          ? [...new Set([...updatedFilters.categorias, value])]
          : updatedFilters.categorias.filter((cat) => cat !== value);
      } else if (name === 'status2') {
        updatedFilters.status2 = checked
          ? [...new Set([...updatedFilters.status2, value])]
          : updatedFilters.status2.filter((stat) => stat !== value);
      } else if (name === 'fornecedor') {
        updatedFilters.fornecedorId = checked
          ? [...new Set([...(prevFilters.fornecedorId || []), value])]
          : prevFilters.fornecedorId.filter((id) => id !== value);
      } else if (name === 'periodStart' || name === 'periodEnd') {
        updatedFilters.period = {
          ...updatedFilters.period,
          [name === 'periodStart' ? 'start' : 'end']: value,
        };
        updatedFilters.month = null;
      } else if (name === 'month') {
        updatedFilters.month = value;
        updatedFilters.period = { start: null, end: null };
      } else if (name === 'tipoTransacao') {
        updatedFilters.tipoTransacao = checked
          ? [...new Set([...updatedFilters.tipoTransacao, value])]
          : updatedFilters.tipoTransacao.filter((tipo) => tipo !== value);
      }

      return updatedFilters;
    });
  };
  // Função de busca com restauração de estado usando filteredContasAPagar
  const handleSearch = (searchTerm) => {
    const normalizedSearchTerm = searchTerm.replace(/[^0-9.]/g, '');

    if (!normalizedSearchTerm) {
      // Quando o campo está vazio, use o estado filtrado atual
      filterContas(); // Reaplica os filtros para restaurar `filteredContasAReceber`
      return;
    }

    // Filtragem normal quando há um termo de busca
    const filtered = filteredContasAPagar.filter(conta => {
      const valorConta = conta.valor.toString();
      return valorConta.includes(normalizedSearchTerm);
    });

    setFilteredContasAPagar(filtered);
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
      fornecedorId: '',
      descricao: '',
      estaPago: false
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
      fornecedorId: conta.fornecedor?.id || '',
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

  // Abrir modal para confirmar pagamento
  const handleConfirm = (conta) => {
    if (conta.status === 'pago') {
      setSelectedConta(conta);
      setShowUndoModal(true);
    } else {
      setSelectedConta({
        ...conta,
        valorOriginal: conta.valor,
      });
      setPagamento({
        pagoEm: '',
        multa: '',
        juros: '',
        desconto: '',
        tipoTransacao: conta.tipoTransacao || ''
      });
      setExpandSection(false);
      setShowConfirmModal(true);
    }
  };

  // Lidar com mudanças de entrada no formulário de nova/edição de conta
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNovaConta({ ...novaConta, [name]: type === 'checkbox' ? (checked ? 'pago' : 'aPagar') : value });
  };

  // Lidar com mudanças de entrada no formulário de pagamento
  const handlePagamentoChange = (e) => {
    const { name, value } = e.target;
    setPagamento({ ...pagamento, [name]: value });
  };

  // Calcular valor total incluindo taxas e descontos
  const calcularValorTotal = () => {
    const parseCurrency = (value) => parseFloat(value.toString().replace(',', '.')) || 0;

    const valorOriginal = parseCurrency(selectedConta?.valor);
    const multa = parseCurrency(pagamento.multa);
    const juros = parseCurrency(pagamento.juros);
    const desconto = parseCurrency(pagamento.desconto);

    const valorTotal = valorOriginal + multa + juros - desconto;

    return valorTotal.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calcular totais para os status 'a pagar' e 'pago'
  const calcularTotais = () => {
    let totalAPagar = 0;
    let totalPago = 0;

    filteredContasAPagar.forEach(conta => {
      const valor = parseFloat(conta.valor) || 0;
      if (conta.status === 'aPagar' || conta.status === 'vencido') {
        totalAPagar += valor;
      } else if (conta.status === 'pago') {
        totalPago += valor;
      }
    });

    const totalPagamentos = totalAPagar + totalPago;

    return {
      totalAPagar: totalAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalPago: totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalPagamentos: totalPagamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    };
  };

  const { totalAPagar, totalPago, totalPagamentos } = calcularTotais();

  // Lidar com a submissão do formulário para adicionar/editar contas
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Extrair apenas os campos permitidos
    const contaToSave = {
      valor: parseFloat(novaConta.valor.replace(',', '.')),
      vencimento: novaConta.vencimento,
      categoria: novaConta.categoria,
      fornecedorId: novaConta.fornecedorId,
      ...(novaConta.descricao && { descricao: novaConta.descricao }),
    };

    try {
      if (modalMode === 'edit') {
        await updateContaAPagar(novaConta.id, contaToSave);
      } else {
        await addContaAPagar(contaToSave);
      }
      setShowModal(false);
      fetchContasAPagar();
    } catch (error) {
      console.error('Erro ao salvar conta a pagar', error);
    }
  };

  // Lidar com a confirmação de pagamento
  const confirmPagamento = async () => {
    if (!pagamento.pagoEm) {
      setNotificationData({
        title: 'Erro',
        message: 'Por favor, preencha a data de pagamento.',
        type: 'error',
        icon: XCircle,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
      return;
    }

    try {
      const updatedConta = {
        pagoEm: pagamento.pagoEm,
      };

      if (pagamento.multa) {
        updatedConta.multa = parseFloat(pagamento.multa);
      }
      if (pagamento.juros) {
        updatedConta.juros = parseFloat(pagamento.juros);
      }
      if (pagamento.desconto) {
        updatedConta.desconto = parseFloat(pagamento.desconto);
      }
      if (pagamento.tipoTransacao) {
        updatedConta.tipoTransacao = pagamento.tipoTransacao;
      }

      await informPagamento(selectedConta.id, updatedConta);

      setShowConfirmModal(false);
      fetchContasAPagar();
    } catch (error) {
      console.error('Erro ao pagar conta', error);
    }
  };

  // Lidar com a desfazer pagamento
  const confirmUndoPagamento = async () => {
    try {
      const updatedConta = {
        ...selectedConta,
        status: 'aPagar',
        valor: selectedConta.valorOriginal,
        pagoEm: null,
        multa: null,
        juros: null,
        desconto: null
      };
      await desfazerPagamento(selectedConta.id, updatedConta);
      setShowUndoModal(false);
      fetchContasAPagar();
    } catch (error) {
      console.error('Erro ao desfazer pagamento da conta', error);
    }
  };

  // Lidar com a exclusão de conta
  const confirmDelete = async () => {
    try {
      await deleteContaAPagar(selectedConta.id);
      setShowDeleteModal(false);
      fetchContasAPagar();
    } catch (error) {
      console.error('Erro ao remover conta a pagar', error);
    }
  };

  // Funça para exportar conta 
  const handleExport = async () => {
    const { categorias, status2, fornecedorId, period, month } = selectedFilters;

    // Definir o período com base nos filtros ou mês atual
    const currentMonth = new Date();
    const defaultStart = startOfMonth(currentMonth);
    const defaultEnd = endOfMonth(currentMonth);

    const periodo = period.start && period.end
      ? `vencimento:${formatDate(period.start)}|${formatDate(period.end)}`
      : month
        ? `vencimento:${format(startOfMonth(new Date(month)), 'yyyy-MM-dd')}|${format(endOfMonth(new Date(month)), 'yyyy-MM-dd')}`
        : `vencimento:${format(defaultStart, 'yyyy-MM-dd')}|${format(defaultEnd, 'yyyy-MM-dd')}`;

    // Construir o filtro concatenado
    const filtros = {
      itensPorPagina: 20000000, // Exportar tudo
      pagina: 1,
      ...(categorias.length > 0 && { filtro: `categoria:${categorias.join(',')}` }),
      ...(status2.length > 0 && { filtro: `status:${status2.join(',')}` }),
      ...(fornecedorId.length > 0 && { filtro: `fornecedor:${fornecedorId.join(',')}` }),
      periodo, // Novo formato de período
    };

    try {
      const data = await exportarContasAPagar(filtros);

      // Criar e baixar o arquivo Excel
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'contas-a-pagar.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Exibir notificação de sucesso
      setNotificationData({
        title: 'Exportação Concluída',
        message: 'As contas a pagar foram exportadas com sucesso!',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      setNotificationData({
        title: 'Erro',
        message: error.message || 'Falha ao exportar contas a pagar.',
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
      paginarItens(filteredContasAPagar, novaPagina, itensPorPagina);
    }
  };

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) {
      const novaPagina = paginaAtual - 1;
      setPaginaAtual(novaPagina);
      paginarItens(filteredContasAPagar, novaPagina, itensPorPagina);
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
          titleButton='Conta a pagar'
          filterConfig={{
            categoria: true,
            status2: true, 
            fornecedor: true, 
            exibirFaturas: true,
            buttonAdd: true,
            buttonPeriod: true,
            buttonMeses: true,
            tipoTransacao: [],
          }}
          categorias={categorias}
          fornecedores={fornecedores}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange} 
          showExportButton={true}
          onExport={handleExport}
        />


        <div className='content content-table'>
          <h1 className='h1-search'>Contas a pagar <SearchBar onSearch={handleSearch} placeholder='Pesquisa pelo valor' /></h1>
          <table className="table">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Categoria</th>
                <th>Origem</th>
                <th>Fornecedor</th>
                <th>Descrição</th>
                <th>Tipo Transação</th>
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
                    <td data-label="Fornecedor">{conta.fornecedor.nomeFantasia}</td>
                    <td data-label="Descrição">{conta.descricao}</td>
                    <td data-label="Tipo Transação">{formatTipoTransacao(conta.tipoTransacao)}</td>
                    <td data-label="Status">
                      <span className={`status ${conta.status.toLowerCase().replace(' ', '-')}`}>{conta.status === 'aPagar' ? 'a pagar' : conta.status}</span>
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
                          </ul>
                        </div>
                      )}
                    </td>
                    <td onClick={() => handleConfirm(conta)} className={`svg-like ${conta.status === 'pago' ? 'received' : conta.status === 'vencido' ? 'overdue' : ''}`}>
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
                setTotalPaginas(Math.ceil(filteredContasAPagar.length / novosItensPorPagina));
                paginarItens(filteredContasAPagar, 1, novosItensPorPagina);
              }}
              className="itens-por-pagina"
            >
              <option value={1}>10</option>
              <option value={2}>20</option>
              <option value={5}>50</option>
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

        {/* Totais */}
        <div className="totais-section">
          <div className="total-item">
            <span>A pagar:</span>
            <span>R${totalAPagar}</span>
          </div>
          <div className="total-item">
            <span>Pago:</span>
            <span>R${totalPago}</span>
          </div>
          <div className="total-item">
            <span>Total de pagamentos:</span>
            <span>R${totalPagamentos}</span>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar, editar e visualizar Conta */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={modalMode === 'view' ? 'Visualizar conta a pagar' : (modalMode === 'edit' ? 'Editar conta a pagar' : 'Nova conta a pagar')}>
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
              {categorias.map((categoria, index) => (
                <option key={index} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fornecedorId">Fornecedor</label>
            <select
              id="fornecedorId"
              name="fornecedorId"
              value={novaConta.fornecedorId}
              onChange={handleChange} required disabled={modalMode === 'view'}>
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((fornecedor, index) => (
                <option key={index} value={fornecedor.id}>{fornecedor.nomeFantasia}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="descricao">Descrição (Opcional)</label>
            <input type="text" id="descricao" name="descricao" value={novaConta.descricao} onChange={handleChange} disabled={modalMode === 'view'} />
          </div>
          {(modalMode !== 'edit' && modalMode !== 'view') && (
            <div className="form-group">
              <input type="checkbox" id="pago" name="estaPago" checked={novaConta.estaPago === 'pago'} onChange={handleChange} />
              <label htmlFor="pago">Marcar como pago</label>
            </div>
          )}
          {novaConta.estaPago === 'pago' && (
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
            {modalMode !== 'view' && <button type="submit" className="save">Salvar</button>}

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

      {/* Modal de Remover conta */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Remover conta a pagar">
        <div className="delete-modal-content">
          <div className="delete-info">
            <div>
              <span>{formatDate(selectedConta?.vencimento)}</span>
              <span>{selectedConta?.categoria}</span>
            </div>
            <span>R${formatValue(selectedConta?.valor)}</span>
          </div>
          <div className="delete-warnings">
            <p className='warnig-conta'><AlertOctagon /> Para haver validade fiscal/contábil é necessário remover também a NF atrelada a essa conta a pagar.</p>
            <p className="error-conta"><XCircle /> Não podemos remover essa conta a pagar. Essa conta foi conciliada com uma transação bancária. Para excluí-la é necessário desfazer a conciliação.</p>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
            <button type="button" className="save" onClick={confirmDelete}>Ok</button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmar pagamento */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirmar o pagamento">
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
              value={pagamento.tipoTransacao}
              onChange={handlePagamentoChange}
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
            <label htmlFor="pagoEm">Data do pagamento</label>
            <input
              type="date"
              id="pagoEm"
              name="pagoEm"
              value={pagamento.pagoEm}
              onChange={handlePagamentoChange}
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
                      <FormattedInput placeholder={"0,00"} type="valor" id="multa" name="multa" value={pagamento.multa} onChange={handlePagamentoChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="juros">Juros</label>
                    <div className='div-sifrao'>
                      <span>R$</span>
                      <FormattedInput placeholder={"0,00"} type="valor" id="juros" name="juros" value={pagamento.juros} onChange={handlePagamentoChange} />
                    </div>
                  </div>
                </div>
                <div className="form-group-modal">
                  <div className="form-group">
                    <label htmlFor="desconto">Desconto</label>
                    <div className='div-sifrao'>
                      <span>R$</span>
                      <FormattedInput placeholder={"0,00"} type="valor" id="desconto" name="desconto" value={pagamento.desconto} onChange={handlePagamentoChange} />
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
            <button type="button" className="save" onClick={confirmPagamento}>Marcar como pago</button>
          </div>
        </div>
      </Modal>

      {/* Modal de desfazer pagamento */}
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
            <p style={{ fontSize: '14px' }}>Confirma que deseja desfazer o pagamento da conta acima?</p>
          </div>
          <br></br>
          <div className="form-actions">
            <button type="button" className="cancel" onClick={() => setShowUndoModal(false)}>Cancelar</button>
            <button type="button" className="save" onClick={confirmUndoPagamento} style={{ backgroundColor: 'red', color: 'white' }}>Desfazer pagamento</button>
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
            Você está criando uma conciliação de conta a pagar com uma NF que será escolhida, tem certeza que deseja realizar esta ação?
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
                    <td>{nf.emitXNome}</td>
                    <td style={{ textTransform: 'capitalize' }}>{nf.situacao || 'N/A'}</td>
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
    </div>
  );
};

export default ContasAPagar;
