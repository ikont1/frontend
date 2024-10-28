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
import { parseISO, format, isValid, startOfMonth, endOfMonth } from 'date-fns'; // Adicione startOfMonth e endOfMonth
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import SearchBar from '../../components/SearchBar/SearchBar';

const ContasReceber = () => {
  const { fetchClientes, clientes } = useClientSupplier();
  const { contasAReceber, fetchContasAReceber, addContaAReceber, updateContaAReceber, deleteContaAReceber, informRecebimento, desfazerRecebimento, categoriasAReceber, fetchCategoriasAReceber, exportarContasAReceber } = useFinance();
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [novaConta, setNovaConta] = useState({
    valor: '',
    vencimento: '',
    categoria: '',
    clienteId: '',
    descricao: '',
    status: 'A receber'
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
    period: {
      start: null,
      end: null
    },
    month: null,
  });  

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
  
      // Lógica para garantir que contas de meses diferentes não apareçam fora do contexto:
      return (
        (matchesPeriod || matchesMonth || (!month && !period.start && !period.end && isCurrentMonth)) &&
        matchesCategoria &&
        matchesStatus &&
        matchesCliente
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
  
    // Verificar se é a ação de limpar filtros
    if (name === 'clear') {
      setSelectedFilters(value); // Define os filtros como padrão
      return; // Interrompe a função
    }
  
    // Atualiza os filtros com base na seleção
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
  
      // Inicializar arrays conforme necessário
      if (!updatedFilters.categorias) updatedFilters.categorias = [];
      if (!updatedFilters.status) updatedFilters.status = [];
      if (!updatedFilters.clienteId) updatedFilters.clienteId = [];
  
      // Manipulação de categorias
      if (name === 'categoria') {
        if (checked) {
          updatedFilters.categorias.push(value);
        } else {
          updatedFilters.categorias = updatedFilters.categorias.filter(
            (cat) => cat !== value
          );
        }
      }
  
      // Manipulação de status
      else if (name === 'status') {
        if (checked) {
          updatedFilters.status.push(value);
        } else {
          updatedFilters.status = updatedFilters.status.filter(
            (stat) => stat !== value
          );
        }
      }
  
      // Manipulação de cliente
      else if (name === 'cliente') {
        if (checked) {
          updatedFilters.clienteId = [...(prevFilters.clienteId || []), value];
        } else {
          updatedFilters.clienteId = prevFilters.clienteId.filter(
            (id) => id !== value
          );
        }
  
        // Remover o filtro se nenhum cliente estiver selecionado
        if (updatedFilters.clienteId.length === 0) {
          delete updatedFilters.clienteId;
        }
      }
  
      // Manipulação de período
      else if (name === 'periodStart' || name === 'periodEnd') {
        updatedFilters.period = {
          ...updatedFilters.period,
          [name === 'periodStart' ? 'start' : 'end']: value,
        };
        updatedFilters.month = null; // Limpar mês ao definir um período
      }
  
      // Manipulação de mês
      else if (name === 'month') {
        updatedFilters.month = value;
        updatedFilters.period = { start: null, end: null }; // Limpar período ao definir mês
      }
  
      return updatedFilters;
    });
  };
    

  // Normalizar string removendo acentos e pontuação
  const normalizeString = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
  };

  // Lidar com o filtro de busca
  const handleSearch = (searchTerm) => {
    const normalizedSearchTerm = normalizeString(searchTerm.toLowerCase());
    const filtered = contasAReceber.filter(conta =>
      normalizeString(conta.categoria.toLowerCase()).includes(normalizedSearchTerm) ||
      normalizeString(conta.descricao.toLowerCase()).includes(normalizedSearchTerm)
    );
    setFilteredContasAReceber(filtered);
  };

  // Formatar data para 'yyyy-MM-dd'
  const formatDate = (dateString) => {
    if (!dateString) return 'Data inválida';
    const parsedDate = parseISO(dateString);
    if (!isValid(parsedDate)) {
      return 'Data inválida';
    }
    return format(parsedDate, 'dd-MM-yyyy');
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
      vencimento: formatDate(conta.vencimento),
      valor: formatValue(conta.valor),
      clienteId: conta.cliente?.id || '',
    });
    setShowModal(true);
  };

  // Abrir modal para visualizar uma conta existente
  const handleView = (conta) => {
    setModalMode('view');
    setNovaConta({
      ...conta,
      vencimento: formatDate(conta.vencimento),
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
      });
      setExpandSection(false);
      setShowConfirmModal(true);
    }
  };

  // Lidar com mudanças de entrada no formulário de nova/edição de conta
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNovaConta({ ...novaConta, [name]: type === 'checkbox' ? (checked ? 'Recebido' : 'A receber') : value });
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

  // Lidar com a submissão do formulário para adicionar/editar contas
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Extrair apenas os campos permitidos
    const contaToSave = {
      valor: parseFloat(novaConta.valor.replace(',', '.')),
      vencimento: novaConta.vencimento,
      categoria: novaConta.categoria,
      clienteId: novaConta.clienteId,
      ...(novaConta.descricao && { descricao: novaConta.descricao }),
    };

    try {
      if (modalMode === 'edit') {
        await updateContaAReceber(novaConta.id, contaToSave);
      } else {
        await addContaAReceber(contaToSave);
      }
      setShowModal(false);
      fetchContasAReceber();
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
      itensPorPagina: 20000000, // Exportar tudo
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
          }}
          categorias={categoriasAReceber}
          clientes={clientes}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          showExportButton={true}
          onExport={handleExport}
        />


        <div className='content content-table'>
          <h1 className='h1-search'>Contas a receber <SearchBar onSearch={handleSearch} placeholder='Categoria/descrição' /></h1>
          <table className="table">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Categoria</th>
                <th>Cliente</th>
                <th>Descrição</th>
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
                      {conta.categoria} <span className="nf-badge">{`NF ${conta.nf || 'N/A'}`}</span>
                    </td>
                    <td data-label="Cliente">{conta.cliente ? conta.cliente.nomeFantasia : 'Cliente não encontrado'}</td>
                    <td data-label="Descrição">{conta.descricao}</td>
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
            <div className="form-group">
              <input type="checkbox" id="recebido" name="status" checked={novaConta.status === 'Recebido'} onChange={handleChange} />
              <label htmlFor="recebido">Marcar como recebido</label>
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
    </div >
  );
};

export default ContasReceber;
