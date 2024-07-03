import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import FilterBar from '../../components/FilterBar/FilterBar';
import Modal from '../../components/Modal/Modal';
import Notification from '../../components/Notification/Notification';
import './ContasPagarReceber.css';
import { AlertOctagon, ThumbsUp, XCircle, ChevronDown, ChevronUp } from 'react-feather';
import axios from 'axios';
import { parseISO, format, isValid } from 'date-fns';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';

const ContasAPagar = () => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [contasAPagar, setContasAPagar] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [novaConta, setNovaConta] = useState({
    valor: '',
    vencimento: '',
    categoria: '',
    cliente: '',
    descricao: '',
    nf: '',
    status: 'A pagar',
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
  const [modalMode, setModalMode] = useState('add'); // add, edit, view
  const [pagamento, setPagamento] = useState({
    dataPagamento: '',
    multa: '',
    juros: '',
    desconto: '',
  });
  const [expandSection, setExpandSection] = useState(false); // controlando a seção expandida

  // Verificar e atualizar status das contas
  const atualizarStatusContas = (contas) => {
    const dataAtual = new Date();
    return contas.map(conta => {
      const vencimento = parseISO(conta.vencimento);
      if (isValid(vencimento) && vencimento < dataAtual && conta.status !== 'Pago') {
        return { ...conta, status: 'Vencido' };
      }
      return conta;
    });
  };

  // Função para buscar os dados da API
  const fetchContasAPagar = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/contasAPagar');
      const contasAtualizadas = atualizarStatusContas(response.data);
      setContasAPagar(contasAtualizadas);
    } catch (error) {
      console.error('Erro ao buscar dados', error);
    }
  }, []);

  // UseEffect para buscar os dados ao carregar o componente
  useEffect(() => {
    fetchContasAPagar();
  }, [fetchContasAPagar]);

  // Formatar a data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data inválida';
    const parsedDate = parseISO(dateString);
    if (!isValid(parsedDate)) {
      return 'Data inválida'; // Retorne uma mensagem de erro ou valor padrão
    }
    return format(parsedDate, 'dd/MM/yyyy');
  };

  // Formatar valor
  const formatValue = (value) => {
    if (!value) return '0,00';
    const numbers = value.replace(/\D/g, '');
    const formatted = numbers
      .replace(/(\d)(\d{2})$/, '$1,$2')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formatted;
  };

  // Ativa o tooltip
  const handleActionsClick = (id) => {
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  // Função para adicionar nova conta a pagar
  const handleAdd = () => {
    setModalMode('add');
    setNovaConta({
      valor: '',
      vencimento: '',
      categoria: '',
      cliente: '',
      descricao: '',
      nf: '',
      status: 'A pagar',
    });
    setShowModal(true);
  };

  // Função para editar conta a pagar
  const handleEdit = (conta) => {
    setModalMode('edit');
    setNovaConta(conta);
    setShowModal(true);
  };

  // Função para visualizar conta a pagar
  const handleView = (conta) => {
    setModalMode('view');
    setNovaConta(conta);
    setShowModal(true);
  };

  // Função para confirmar exclusão
  const handleDelete = (conta) => {
    setSelectedConta(conta);
    setShowDeleteModal(true);
  };

  // Função para confirmar pagamento
  const handleConfirm = (conta) => {
    if (conta.status === 'Pago') {
      setSelectedConta(conta);
      setShowUndoModal(true);
    } else {
      setSelectedConta({
        ...conta,
        valorOriginal: conta.valor, // Armazena o valor original
      });
      setPagamento({
        dataPagamento: '',
        multa: '',
        juros: '',
        desconto: '',
      });
      setExpandSection(false); // Resetar a expansão da seção
      setShowConfirmModal(true);
    }
  };

  // Carregar os dados da nova conta a pagar
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNovaConta({ ...novaConta, [name]: type === 'checkbox' ? (checked ? 'Pago' : 'A pagar') : value });
  };

  // Carregar os dados de pagamento
  const handlePagamentoChange = (e) => {
    const { name, value } = e.target;
    setPagamento({ ...pagamento, [name]: value });
  };

  // Calcular valor total do modal de confirmar pagamento
  const calcularValorTotal = () => {
    const parseCurrency = (value) => parseFloat(value.replace(/(\d)(\d{2})$/, '$1,$2').replace(',', '.')) || 0;

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

  // Funçao de calcular totais de contas a pagar, pagas  e total de pagamentos
  const calcularTotais = () => {
    let totalAPagar = 0;
    let totalPago = 0;

    contasAPagar.forEach(conta => {
      const valor = parseFloat(conta.valor?.replace(/(\d)(\d{2})$/, '$1,$2').replace(',', '.') || 0);
      if (conta.status === 'A pagar' || conta.status === 'Vencido') {
        totalAPagar += valor;
      } else if (conta.status === 'Pago') {
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

  // Salvar/editar conta
  const handleSubmit = async (e) => {
    e.preventDefault();
    const contaToSave = {
      ...novaConta,
      status: novaConta.status === 'Pago' ? 'Pago' : 'A pagar',
      valor: novaConta.valor.replace('.', '').replace(',', '.'),
      valorOriginal: novaConta.valor.replace('.', '').replace(',', '.')
    };
    try {
      if (modalMode === 'edit') {
        await axios.put(`http://localhost:3001/contasAPagar/${novaConta.id}`, contaToSave);
        setNotificationData({
          title: 'Dados Salvos',
          message: 'Conta a pagar atualizada com sucesso.',
          type: 'success',
          icon: ThumbsUp,
          buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
        });
      } else {
        await axios.post('http://localhost:3001/contasAPagar', contaToSave);
        setNotificationData({
          title: 'Parabéns',
          message: 'Conta a pagar adicionada com sucesso.',
          type: 'success',
          icon: ThumbsUp,
          buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
        });
      }
      setShowNotification(true);
      setShowModal(false);
      fetchContasAPagar();
    } catch (error) {
      console.error('Erro ao salvar conta a pagar', error);
    }
  };

  // Confirmar pagamento de conta apagar
  const confirmPagamento = async () => {
    if (!pagamento.dataPagamento) {
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
      const valorTotal = calcularValorTotal();
      const valorTotalSemFormato = valorTotal.replace(/\./g, '').replace(',', ''); // Remove pontos e vírgulas

      const updatedConta = {
        ...selectedConta,
        status: 'Pago',
        valor: valorTotalSemFormato,
        dataPagamento: pagamento.dataPagamento
      };
      await axios.put(`http://localhost:3001/contasAPagar/${selectedConta.id}`, updatedConta);
      setNotificationData({
        title: 'Sucesso',
        message: 'A conta foi paga com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
      setShowConfirmModal(false);
      fetchContasAPagar();
    } catch (error) {
      console.error('Erro ao pagar conta', error);
    }
  };

  // Desfazer pagamento de conta
  const confirmUndoPagamento = async () => {
    try {
      const updatedConta = {
        ...selectedConta,
        status: 'A pagar',
        valor: selectedConta.valorOriginal, // Restaura o valor original
        dataPagamento: ''
      };
      await axios.put(`http://localhost:3001/contasAPagar/${selectedConta.id}`, updatedConta);
      setNotificationData({
        title: 'Sucesso',
        message: 'O pagamento da conta foi desfeito com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
      setShowUndoModal(false);
      fetchContasAPagar();
    } catch (error) {
      console.error('Erro ao desfazer pagamento da conta', error);
    }
  };

  // excluir conta
  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/contasAPagar/${selectedConta.id}`);
      setNotificationData({
        title: 'Pagamento Removido',
        message: 'A conta a pagar foi removida com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
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
            status2: true,
            buttonAdd: true,
            buttonPeriod: true,
            buttonMeses: true,
          }}
        />

        <div className='content content-table'>
          <h1>Contas a pagar</h1>
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
              {contasAPagar.map((conta, index) => (
                <tr key={index}>
                  <td data-label="Vencimento">{formatDate(conta.vencimento)}</td>
                  <td data-label="Categoria">
                    {conta.categoria} <span className="nf-badge">{`NF ${conta.nf || 'N/A'}`}</span>
                  </td>
                  <td data-label="Cliente">{conta.cliente}</td>
                  <td data-label="Descrição">{conta.descricao}</td>
                  <td data-label="Status">
                    <span className={`status ${conta.status.toLowerCase().replace(' ', '-')}`}>{conta.status}</span>
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
                  <td onClick={() => handleConfirm(conta)} className={`svg-like ${conta.status === 'Pago' ? 'received' : ''}`}>
                    <ThumbsUp />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

      {/* Modal de cadastrar/editar conta */}
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
            <input type="text" id="categoria" name="categoria" value={novaConta.categoria} onChange={handleChange} required disabled={modalMode === 'view'} />
          </div>
          <div className="form-group">
            <label htmlFor="cliente">Cliente</label>
            <input type="text" id="cliente" name="cliente" value={novaConta.cliente} onChange={handleChange} required disabled={modalMode === 'view'} />
          </div>
          <div className="form-group">
            <label htmlFor="descricao">Descrição (Opcional)</label>
            <input type="text" id="descricao" name="descricao" value={novaConta.descricao} onChange={handleChange} disabled={modalMode === 'view'} />
          </div>
          {(modalMode !== 'edit' && modalMode !== 'view') && (
            <div className="form-group">
              <input type="checkbox" id="pago" name="status" checked={novaConta.status === 'Pago'} onChange={handleChange} />
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

      {/* Modal de excluir conta */}
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

      {/* Modal de confirmar pagamento */}
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
            <label htmlFor="dataPagamento">Data do pagamento</label>
            <input
              type="date"
              id="dataPagamento"
              name="dataPagamento"
              value={pagamento.dataPagamento}
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
