import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import FilterBar from '../../components/FilterBar/FilterBar';
import Modal from '../../components/Modal/Modal';
import Notification from '../../components/Notification/Notification';
import './ContasPagarReceber.css';
import { AlertOctagon, ThumbsUp, XCircle, ChevronDown, ChevronUp } from 'react-feather';
import { useFinance } from '../../context/FinanceContext';
import { useClientSupplier } from '../../context/ClientSupplierContext';
import { parseISO, format, isValid, startOfMonth, endOfMonth } from 'date-fns';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';
import SearchBar from '../../components/SearchBar/SearchBar';

const ContasAPagar = () => {
  const { fetchFornecedores, fornecedores } = useClientSupplier();
  const { contasAPagar, fetchContasAPagar, addContaAPagar, updateContaAPagar, deleteContaAPagar, informPagamento, desfazerPagamento, categorias, fetchCategorias } = useFinance();
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
    status2: [],
    period: {
      start: null,
      end: null
    },
    month: null,
  });

  // Buscar dados iniciais
  useEffect(() => {
    fetchContasAPagar();
    fetchCategorias();
    fetchFornecedores();
  }, [fetchContasAPagar, fetchCategorias, fetchFornecedores]);

  const filterContas = useCallback(() => {
    const { categorias = [], status2, fornecedorId, period, month } = selectedFilters;
    const currentMonth = new Date();

    const filtered = contasAPagar.filter(conta => {
      const contaVencimento = new Date(conta.vencimento);

      const isCurrentMonth = contaVencimento.getMonth() === currentMonth.getMonth() &&
        contaVencimento.getFullYear() === currentMonth.getFullYear();
      const isOverdue = conta.status.toLowerCase() === 'vencido';

      const matchesCategoria = categorias.length === 0 || categorias.includes(conta.categoria);
      const matchesStatus = status2.length === 0 || status2.includes(conta.status.toLowerCase());

      // Verificar se o fornecedor é compatível
      const matchesFornecedor = !fornecedorId || (conta.fornecedor && String(conta.fornecedor.id) === String(fornecedorId));

      const matchesPeriod = (period.start && period.end &&
        contaVencimento >= new Date(period.start) &&
        contaVencimento <= new Date(period.end));
      const matchesMonth = (!period.start && !period.end && (!month && (isCurrentMonth || isOverdue))) ||
        (month && (contaVencimento >= startOfMonth(new Date(month)) &&
          contaVencimento <= endOfMonth(new Date(month))));

      return matchesCategoria && matchesStatus && matchesFornecedor && (matchesPeriod || matchesMonth);
    });

    // Ordenar as contas vencidas no topo
    const sortedFiltered = filtered.sort((a, b) => {
      if (a.status === 'vencido' && b.status !== 'vencido') return -1;
      if (a.status !== 'vencido' && b.status === 'vencido') return 1;
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

  const handleFilterChange = (e) => {
    const { name, value, checked } = e.target;
  
    setSelectedFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
  
      // Verificar se a propriedade categorias existe e, se não, inicializar como array vazio
      if (!updatedFilters.categorias) {
        updatedFilters.categorias = [];
      }
  
      if (name === 'categoria') {
        if (checked) {
          updatedFilters.categorias.push(value); // Adicionar categoria se selecionada
        } else {
          updatedFilters.categorias = updatedFilters.categorias.filter(cat => cat !== value); // Remover categoria se desmarcada
        }
      } else if (name === 'status2') {
        if (checked) {
          updatedFilters.status2.push(value);
        } else {
          updatedFilters.status2 = updatedFilters.status2.filter(stat => stat !== value);
        }
      } else if (name === 'fornecedor') {
        updatedFilters.fornecedorId = checked ? value : null;
      } else if (name === 'periodStart' || name === 'periodEnd') {
        updatedFilters.period = {
          ...updatedFilters.period,
          [name === 'periodStart' ? 'start' : 'end']: value,
        };
        // Resetar filtro de mês ao selecionar um período
        updatedFilters.month = null;
      } else if (name === 'month') {
        updatedFilters.month = value;
        // Resetar período ao selecionar um mês
        updatedFilters.period = {
          start: null,
          end: null,
        };
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
    const filtered = contasAPagar.filter(conta =>
      normalizeString(conta.categoria.toLowerCase()).includes(normalizedSearchTerm) ||
      normalizeString(conta.descricao.toLowerCase()).includes(normalizedSearchTerm)
    );
    setFilteredContasAPagar(filtered);
  };

  // Formatar data para 'yyyy-MM-dd'
  const formatDate = (dateString) => {
    if (!dateString) return 'Data inválida';
    const parsedDate = parseISO(dateString);
    if (!isValid(parsedDate)) {
      return 'Data inválida';
    }
    return format(parsedDate, 'yyyy-MM-dd');
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
      vencimento: formatDate(conta.vencimento),
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
      descricao: novaConta.descricao,
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
          }}
          categorias={categorias}
          fornecedores={fornecedores}
          onFilterChange={handleFilterChange}
        />

        <div className='content content-table'>
          <h1 className='h1-search'>Contas a pagar <SearchBar onSearch={handleSearch} placeholder='Categoria/descrição' /></h1>
          <table className="table">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Ações</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredContasAPagar.length > 0 ? (
                filteredContasAPagar.map((conta, index) => (
                  <tr key={index}>
                    <td data-label="Vencimento">{formatDate(conta.vencimento)}</td>
                    <td data-label="Categoria">{conta.categoria}</td>
                    <td data-label="Fornecedor">{conta.fornecedor ? conta.fornecedor.nomeFantasia : 'Fornecedor não informado'}</td>
                    <td data-label="Descrição">{conta.descricao}</td>
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
    </div>
  );
};

export default ContasAPagar;
