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

const ContasReceber = () => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [contasReceber, setContasReceber] = useState([]);
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
  const [modalMode, setModalMode] = useState('add'); // add, edit, view
  const [recebimento, setRecebimento] = useState({
    dataRecebimento: '',
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
      if (isValid(vencimento) && vencimento < dataAtual && conta.status !== 'Recebido') {
        return { ...conta, status: 'Vencido' };
      }
      return conta;
    });
  };

  // Função para buscar os dados da API
  const fetchContasReceber = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/contasReceber');
      const contasAtualizadas = atualizarStatusContas(response.data);
      setContasReceber(contasAtualizadas);
    } catch (error) {
      console.error('Erro ao buscar dados', error);
    }
  }, []);

  // UseEffect para buscar os dados ao carregar o componente
  useEffect(() => {
    fetchContasReceber();
  }, [fetchContasReceber]);

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

  // Função para adicionar nova conta a receber
  const handleAdd = () => {
    setModalMode('add');
    setNovaConta({
      valor: '',
      vencimento: '',
      categoria: '',
      cliente: '',
      descricao: '',
      nf: '',
      status: 'A receber',
    });
    setShowModal(true);
  };

  // Função para editar conta a receber
  const handleEdit = (conta) => {
    setModalMode('edit');
    setNovaConta(conta);
    setShowModal(true);
  };

  // Função para visualizar conta a receber
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

  // Função para confirmar recebimento
  const handleConfirm = (conta) => {
    if (conta.status === 'Recebido') {
      setSelectedConta(conta);
      setShowUndoModal(true);
    } else {
      setSelectedConta({
        ...conta,
        valorOriginal: conta.valor, // Armazena o valor original
      });
      setRecebimento({
        dataRecebimento: '',
        multa: '',
        juros: '',
        desconto: '',
      });
      setExpandSection(false); // Resetar a expansão da seção
      setShowConfirmModal(true);
    }
  };

  // Carregar os dados da nova conta
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNovaConta({ ...novaConta, [name]: type === 'checkbox' ? (checked ? 'Recebido' : 'A receber') : value });
  };

  // Carregar os dados de recebimento
  const handleRecebimentoChange = (e) => {
    const { name, value } = e.target;
    setRecebimento({ ...recebimento, [name]: value });
  };

  // Calcular valor total do modal de confirmar pagamento
  const calcularValorTotal = () => {
    const parseCurrency = (value) => parseFloat(value.replace(/(\d)(\d{2})$/, '$1,$2').replace(',', '.')) || 0;

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

  // Funçao de calcular totais de contas a receber, recibidas  e despesas
  const calcularTotais = () => {
    let totalAReceber = 0;
    let totalRecebido = 0;
    let totalVencido = 0;

    contasReceber.forEach(conta => {
      const valor = parseFloat(conta.valor.replace(/(\d)(\d{2})$/, '$1,$2').replace(',', '.'));
      if (conta.status === 'A receber' || conta.status === 'Vencido') {
        totalAReceber += valor;
      } else if (conta.status === 'Recebido') {
        totalRecebido += valor;
      } else {
        totalVencido += valor;
      }
    });

    const totalReceitas = totalAReceber + totalRecebido + totalVencido;

    return {
      totalAReceber: totalAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalRecebido: totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalReceitas: totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    };
  };

  const { totalAReceber, totalRecebido, totalReceitas } = calcularTotais();

  // Salvar/editar conta
  const handleSubmit = async (e) => {
    e.preventDefault();
    const contaToSave = {
      ...novaConta,
      status: novaConta.status === 'Recebido' ? 'Recebido' : 'A receber',
      valor: novaConta.valor.replace('.', '').replace(',', '.'),
      valorOriginal: novaConta.valor.replace('.', '').replace(',', '.')
    };
    try {
      if (modalMode === 'edit') {
        await axios.put(`http://localhost:3001/contasReceber/${novaConta.id}`, contaToSave);
        setNotificationData({
          title: 'Dados Salvos',
          message: 'Conta a receber atualizada com sucesso.',
          type: 'success',
          icon: ThumbsUp,
          buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
        });
      } else {
        await axios.post('http://localhost:3001/contasReceber', contaToSave);
        setNotificationData({
          title: 'Parabéns',
          message: 'Conta a receber adicionada com sucesso.',
          type: 'success',
          icon: ThumbsUp,
          buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
        });
      }
      setShowNotification(true);
      setShowModal(false);
      fetchContasReceber();
    } catch (error) {
      console.error('Erro ao salvar conta a receber', error);
    }
  };

  // Confirmar recebimento de conta
  const confirmRecebimento = async () => {
    if (!recebimento.dataRecebimento) {
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
      const valorTotal = calcularValorTotal();
      const valorTotalSemFormato = valorTotal.replace(/\./g, '').replace(',', ''); // Remove pontos e vírgulas

      const updatedConta = {
        ...selectedConta,
        status: 'Recebido',
        valor: valorTotalSemFormato,
        dataRecebimento: recebimento.dataRecebimento
      };
      await axios.put(`http://localhost:3001/contasReceber/${selectedConta.id}`, updatedConta);
      setNotificationData({
        title: 'Sucesso',
        message: 'A conta foi recebida com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
      setShowConfirmModal(false);
      fetchContasReceber();
    } catch (error) {
      console.error('Erro ao receber conta', error);
    }
  };

  // Desfazer recebimento de conta
  const confirmUndoRecebimento = async () => {
    try {
      const updatedConta = {
        ...selectedConta,
        status: 'A receber',
        valor: selectedConta.valorOriginal, // Restaura o valor original
        dataRecebimento: ''
      };
      await axios.put(`http://localhost:3001/contasReceber/${selectedConta.id}`, updatedConta);
      setNotificationData({
        title: 'Sucesso',
        message: 'O recebimento da conta foi desfeito com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
      setShowUndoModal(false);
      fetchContasReceber();
    } catch (error) {
      console.error('Erro ao desfazer recebimento da conta', error);
    }
  };

  // excluir conta
  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/contasReceber/${selectedConta.id}`);
      setNotificationData({
        title: 'Conta Removida',
        message: 'A conta a receber foi removida com sucesso.',
        type: 'success',
        icon: ThumbsUp,
        buttons: [{ label: 'Ok', onClick: () => setShowNotification(false) }],
      });
      setShowNotification(true);
      setShowDeleteModal(false);
      fetchContasReceber();
    } catch (error) {
      console.error('Erro ao remover conta a receber', error);
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
        />

        <div className='content content-table'>
          <h1>Contas a receber</h1>
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
              {contasReceber.map((conta, index) => (
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
                  <td onClick={() => handleConfirm(conta)} className={`svg-like ${conta.status === 'Recebido' ? 'received' : ''}`}>
                    <ThumbsUp />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
              <input type="checkbox" id="recebido" name="status" checked={novaConta.status === 'Recebido'} onChange={handleChange} />
              <label htmlFor="recebido">Marcar como recebida</label>
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
            <label htmlFor="dataRecebimento">Data do recebimento</label>
            <input
              type="date"
              id="dataRecebimento"
              name="dataRecebimento"
              value={recebimento.dataRecebimento}
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
