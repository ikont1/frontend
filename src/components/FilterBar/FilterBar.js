import React, { useState, useEffect, useRef } from 'react';
import './FilterBar.css';
import { Calendar, PlusCircle, Filter, ArrowDown, ChevronLeft, ChevronRight, Download, XCircle } from 'react-feather';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addMonths, subMonths, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

// Registrar a localização em português
registerLocale('pt-BR', ptBR);

const FilterBar = ({ onAdd, titleButton, filterConfig, categorias, clientes, fornecedores, onFilterChange, showExportButton, onExport, selectedFilters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchCliente, setSearchCliente] = useState('');
  const [filteredClientes, setFilteredClientes] = useState(clientes || []);
  const [searchfornecedor, setSearchFornecedor] = useState('');
  const [filteredFornecedores, setFilteredFornecedores] = useState(fornecedores || []);

  const activeModalRef = useRef(null);


  // Atualizar clientes/fornecedor filtrados quando a lista de clientes mudar
  useEffect(() => {
    setFilteredClientes(clientes || []);
    setFilteredFornecedores(fornecedores || []);
  }, [clientes, fornecedores]);

  // Função para detectar clique fora e fechar modal
  const handleClickOutside = (event) => {
    if (
      !activeModalRef.current?.contains(event.target)
    ) {
      setActiveModal(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  // Alternar exibição dos filtros
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Alternar exibição dos modais
  const toggleModal = (modal, ref) => {
    activeModalRef.current = ref;
    setActiveModal(activeModal === modal ? null : modal);
  };

  // const handleModalSelect = (modal) => {
  //   setActiveModal(null); // Fechar o modal após a seleção
  // };

  // Navegar para o mês anterior
  const handlePrevMonth = () => {
    const newMonth = subMonths(selectedMonth, 1);
    setSelectedMonth(newMonth);
    // Atualizar filtro por mês
    onFilterChange({
      target: {
        name: 'month',
        value: newMonth.toISOString().split('T')[0],
      }
    });
  };

  // Navegar para o próximo mês
  const handleNextMonth = () => {
    const newMonth = addMonths(selectedMonth, 1);
    setSelectedMonth(newMonth);
    // Atualizar filtro por mês
    onFilterChange({
      target: {
        name: 'month',
        value: newMonth.toISOString().split('T')[0],
      }
    });
  };

  // Alternar exibição do seletor de data
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  // Aplicar filtro por período
  const applyPeriodFilter = () => {
    setShowDatePicker(false);
    onFilterChange({
      target: {
        name: 'periodStart',
        value: startDate ? startDate.toISOString().split('T')[0] : null,
      }
    });
    onFilterChange({
      target: {
        name: 'periodEnd',
        value: endDate ? endDate.toISOString().split('T')[0] : null,
      }
    });
  };

  // Filtrar fornecedor com base no texto digitado
  const handleFornecedorSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchFornecedor(searchTerm);

    const filtered = (fornecedores || []).filter(fornecedor =>
      fornecedor.nomeFantasia.toLowerCase().includes(searchTerm)
    );

    setFilteredFornecedores(filtered);
  };

  // Filtrar clientes com base no texto digitado
  const handleClientSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchCliente(searchTerm);

    const filtered = (clientes || []).filter(cliente =>
      cliente.nomeFantasia.toLowerCase().includes(searchTerm) ||
      cliente.cpfCnpj.replace(/\D/g, '').includes(searchTerm)
    );

    setFilteredClientes(filtered);
  };

  // Função para limpar os filtros
  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedMonth(new Date());

    onFilterChange({
      target: {
        name: 'resetFilters',
        value: {
          categorias: [],
          status: [],
          status2: [],
          clienteId: [],
          fornecedorId: [],
          tipoTransacao: [],
          period: { start: null, end: null },
          month: null,
        }
      }
    });
  };


  return (
    <div className='filter-bar-container'>
      <div className="filter-bar">


        {/* Botão para adicionar nova conta */}
        {filterConfig.buttonAdd && (
          <button className="add-button-receber" onClick={onAdd}>
            <PlusCircle /> {titleButton}
          </button>
        )}

        <div className="filters">

          {/* Filtro por mês */}
          {filterConfig.buttonMeses && (
            <div className="date-filter">
              <ChevronLeft className="icon-left" onClick={handlePrevMonth} />
              <Calendar /> {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
              <ChevronRight className="icon-right" onClick={handleNextMonth} />
            </div>
          )}

          {/* Filtro por período */}
          {filterConfig.buttonPeriod && (
            <button className="period-button" onClick={toggleDatePicker}>
              <Calendar />
              {startDate && endDate
                ? `${startDate.toLocaleDateString("pt-BR")} - ${endDate.toLocaleDateString("pt-BR")}`
                : "Selecionar período"
              }
            </button>
          )}

          {/* Seletor de datas */}
          {showDatePicker && (
            <div className="date-picker-modal">
              <span>Data início</span>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                inline
              />
              <span>Data fim</span>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                inline
              />
              <button onClick={applyPeriodFilter}>Aplicar</button>
            </div>
          )}

        </div>
      </div>

      <div className='container-filtrar-pesquisar'>
        <button className="filter-button" onClick={toggleFilters}>
          <Filter /> Filtrar
        </button>
        {showExportButton && (
          <button className="export-button" onClick={onExport}>
            <Download /> Exportar
          </button>
        )}
        <button className="filter-button clean-filter" onClick={handleClearFilters}>
          <XCircle /> Limpar Filtros
        </button>
      </div>

      {/* Filtros avançados */}
      {showFilters && (
        <div className="advanced-filters">

          {/* Filtro por categoria */}
          {filterConfig.categoria && (
            <div className="form-group">
              <h5>Categoria</h5>
              <button onClick={() => toggleModal('categoria')}>
                <div>
                  {selectedFilters.categorias.length > 0 && (
                    <span className="filter-count">{selectedFilters.categorias.length}</span>
                  )}
                  {selectedFilters?.categorias && selectedFilters.categorias.length > 0
                    ? 'Filtradas'
                    : 'Todos'}
                </div>
                <ArrowDown />
              </button>

              {activeModal === 'categoria' && (
                <div ref={activeModalRef} className="modal-filter">
                  <ul>
                    {categorias.map(categoria => (
                      <li key={categoria}>
                        <label>
                          <input
                            type="checkbox"
                            name="categoria"
                            onChange={(e) => {
                              onFilterChange(e);
                            }}
                            value={categoria}
                            checked={selectedFilters.categorias.includes(categoria)}
                          />
                          {categoria}
                        </label>
                      </li>
                    ))}

                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Filtro por status (contas a receber) */}
          {filterConfig.status && (
            <div className="form-group">
              <h5>Status</h5>
              <button onClick={() => toggleModal('status')}>
                <div>
                  {selectedFilters.status.length > 0 && (
                    <span className="filter-count">{selectedFilters.status.length}</span>
                  )}
                  {selectedFilters?.status && selectedFilters.status.length > 0
                    ? 'Filtradas'
                    : 'Todos'}
                </div>
                <ArrowDown />
              </button>
              {activeModal === 'status' && (
                <div ref={activeModalRef} className="modal-filter">
                  <h5>Status</h5>
                  <ul>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="status"
                          onChange={(e) => {
                            onFilterChange(e);
                          }}
                          value="areceber"
                          checked={selectedFilters?.status?.includes('areceber')}
                        /> A receber
                      </label>
                    </li>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="status"
                          onChange={(e) => {
                            onFilterChange(e);
                          }}
                          value="recebido"
                          checked={selectedFilters?.status?.includes('recebido')}
                        /> Recebido
                      </label>
                    </li>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="status"
                          onChange={(e) => {
                            onFilterChange(e);
                          }}
                          value="vencido"
                          checked={selectedFilters?.status?.includes('vencido')}
                        /> Vencido
                      </label>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Filtro por status (contas a pagar) */}
          {filterConfig.status2 && (
            <div className="form-group">
              <h5>Status</h5>
              <button onClick={() => toggleModal('status2')}>
                <div>
                  {selectedFilters.status2.length > 0 && (
                    <span className="filter-count">{selectedFilters.status2.length}</span>
                  )}
                  {selectedFilters?.status2 && selectedFilters.status2.length > 0
                    ? 'Filtradas'
                    : 'Todos'}
                </div>
                <ArrowDown />
              </button>
              {activeModal === 'status2' && (
                <div ref={activeModalRef} className="modal-filter">
                  <ul>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="status2"
                          value="apagar"
                          onChange={(e) => {
                            onFilterChange(e);
                          }}
                          checked={selectedFilters?.status2?.includes('apagar')}
                        /> A pagar
                      </label>
                    </li>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="status2"
                          value="pago"
                          onChange={(e) => {
                            onFilterChange(e);
                          }}
                          checked={selectedFilters?.status2?.includes('pago')}
                        /> Pago
                      </label>
                    </li>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="status2"
                          value="vencido"
                          onChange={(e) => {
                            onFilterChange(e);
                          }}
                          checked={selectedFilters?.status2?.includes('vencido')}
                        /> Vencido
                      </label>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Filtro por cliente */}
          {filterConfig.cliente && (
            <div className="form-group">
              <h5>Cliente</h5>
              <button onClick={() => toggleModal('cliente')}>
                <div>
                  {selectedFilters.clienteId?.length > 0 && (
                    <span className="filter-count">{selectedFilters.clienteId.length}</span>
                  )}
                  {selectedFilters?.clienteId?.length > 0 ? 'Filtrados' : 'Todos'}
                </div>
                <ArrowDown />
              </button>
              {activeModal === 'cliente' && (
                <div ref={activeModalRef} className="modal-filter">
                  <h5>Escolha os clientes</h5>
                  <input
                    type="text"
                    placeholder="Digite nome ou CPF/CNPJ"
                    value={searchCliente}
                    onChange={handleClientSearch}
                  />
                  <ul>
                    {filteredClientes.map((cliente) => (
                      <li key={cliente.id}>
                        <label>
                          <input
                            type="checkbox"
                            name="cliente"
                            onChange={(e) => {
                              onFilterChange(e); // Chama a função de filtro
                            }}
                            value={cliente.id}
                            checked={selectedFilters.clienteId?.includes(String(cliente.id))}
                          />
                          {cliente.nomeFantasia} - {cliente.cpfCnpj}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Filtro por fornecedor */}
          {filterConfig.fornecedor && (
            <div className="form-group">
              <h5>Fornecedor</h5>
              <button onClick={() => toggleModal('fornecedor')}>
                <div>
                  {selectedFilters.fornecedorId?.length > 0 && (
                    <span className="filter-count">{selectedFilters.fornecedorId.length}</span>
                  )}
                  {selectedFilters?.fornecedorId?.length > 0
                    ? 'Filtrados'
                    : 'Todos'}
                </div>
                <ArrowDown />
              </button>
              {activeModal === 'fornecedor' && (
                <div ref={activeModalRef} className="modal-filter">
                  <h5>Escolha os fornecedores</h5>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={searchfornecedor}
                    onChange={handleFornecedorSearch}
                  />
                  <ul>
                    {filteredFornecedores.map((fornecedor) => (
                      <li key={fornecedor.id}>
                        <label>
                          <input
                            type="checkbox"
                            name="fornecedor"
                            onChange={(e) => {
                              onFilterChange(e);
                            }}
                            value={fornecedor.id}
                            checked={selectedFilters.fornecedorId?.includes(String(fornecedor.id))}
                          />
                          {fornecedor.nomeFantasia}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Filtro por tipo de transação (tipoTransacao) */}
          {filterConfig.tipoTransacao && (
            <div className="form-group">
              <h5>Tipo de transação</h5>
              <button onClick={() => toggleModal('tipoTransacao')}>
                <div>
                  {selectedFilters.tipoTransacao?.length > 0 && (
                    <span className="filter-count">{selectedFilters.tipoTransacao.length}</span>
                  )}
                  {selectedFilters?.tipoTransacao?.length > 0 ? 'Filtrados' : 'Todos'}
                </div>
                <ArrowDown />
              </button>
              {activeModal === 'tipoTransacao' && (
                <div ref={activeModalRef} className="modal-filter">
                  <ul>
                    {[
                      "pix",
                      "boleto",
                      "transferencia",
                      "compraNoDebito",
                      "pagamentoFaturaCartao",
                      "recargaCelular",
                      "cobrancaBB",
                      "outro",
                    ].map((tipo) => {
                      // Mapeamento de nomes legíveis
                      const tipoTransacaoLabels = {
                        pix: "PIX",
                        boleto: "Boleto",
                        transferencia: "Transferência",
                        compraNoDebito: "Compra no Débito",
                        pagamentoFaturaCartao: "Pagamento de Fatura",
                        recargaCelular: "Recarga de Celular",
                        cobrancaBB: "Cobrança BB",
                        outro: "Outro",
                      };

                      return (
                        <li key={tipo}>
                          <label>
                            <input
                              type="checkbox"
                              name="tipoTransacao"
                              value={tipo}
                              onChange={(e) => {
                                const { name, value, checked } = e.target;

                                onFilterChange({
                                  target: {
                                    name,
                                    value,
                                    checked,
                                  },
                                });
                              }}
                              checked={selectedFilters.tipoTransacao?.includes(tipo) || false}
                            />
                            {tipoTransacaoLabels[tipo] || tipo} {/* Nome formatado */}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Filtro por situação da nota fiscal */}
          {filterConfig.situacaoNF && (
            <div className="form-group">
              <h5>Situação NF</h5>
              <button onClick={() => toggleModal('situacaoNF')}>
                <div>
                  {selectedFilters.situacoes?.length > 0 && (
                    <span className="filter-count">{selectedFilters.situacoes.length}</span>
                  )}
                  {selectedFilters?.situacoes?.length > 0 ? 'Filtradas' : 'Todos'}
                </div>
                <ArrowDown />
              </button>
              {activeModal === 'situacaoNF' && (
                <div ref={activeModalRef} className="modal-filter">
                  <ul>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="situacaoNF"
                          value="emitida"
                          onChange={(e) => {
                            onFilterChange(e);
                          }}
                          checked={selectedFilters?.situacoes?.includes('emitida')}
                        /> Emitida
                      </label>
                    </li>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="situacaoNF"
                          value="cancelada"
                          onChange={(e) => {
                            onFilterChange(e);
                          }}
                          checked={selectedFilters?.situacoes?.includes('cancelada')}
                        /> Cancelada
                      </label>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default FilterBar;
