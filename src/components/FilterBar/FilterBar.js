import React, { useState, useEffect } from 'react';
import './FilterBar.css';
import { Calendar, PlusCircle, Filter, ArrowDown, ChevronLeft, ChevronRight, Download } from 'react-feather';
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

  // Atualizar clientes/fornecedor filtrados quando a lista de clientes mudar
  useEffect(() => {
    setFilteredClientes(clientes || []);
    setFilteredFornecedores(fornecedores || []);
  }, [clientes, fornecedores]);


  // Alternar exibição dos filtros
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Alternar exibição dos modais
  const toggleModal = (modal) => {
    setActiveModal(activeModal === modal ? null : modal);
  };

  const handleModalSelect = (modal) => {
    setActiveModal(null); // Fechar o modal após a seleção
  };

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

    // Zerar as datas após aplicar o filtro
    setStartDate(null);
    setEndDate(null);
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
      cliente.nomeFantasia.toLowerCase().includes(searchTerm)
    );

    setFilteredClientes(filtered);
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
              <Calendar /> Selecionar período
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
      </div>

      {/* Filtros avançados */}
      {showFilters && (
        <div className="advanced-filters">

          {/* Filtro por categoria */}
          {filterConfig.categoria && (
            <div className="form-group">
              <h5>Categoria</h5>
              <button onClick={() => toggleModal('categoria')}>
                {selectedFilters?.categorias && selectedFilters.categorias.length > 0
                  ? 'Filtradas' // Exibe as categorias selecionadas separadas por vírgula
                  : 'Todos'} {/* Caso nenhuma categoria esteja selecionada */}
                <ArrowDown />
              </button>

              {activeModal === 'categoria' && (
                <div className="modal-filter">
                  <ul>
                    {categorias.map(categoria => (
                      <li key={categoria}>
                        <label>
                          <input
                            type="checkbox"
                            name="categoria"
                            onChange={(e) => {
                              onFilterChange(e);
                              handleModalSelect('categoria'); // Fechar modal ao selecionar
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
                {selectedFilters?.status && selectedFilters.status.length > 0
                  ? 'Filtradas'
                  : 'Todos'}
                <ArrowDown />
              </button>
              {activeModal === 'status' && (
                <div className="modal-filter">
                  <h5>Status</h5>
                  <ul>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="status"
                          onChange={(e) => {
                            onFilterChange(e);
                            handleModalSelect('status'); // Fecha o modal após selecionar
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
                            handleModalSelect('status');
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
                            handleModalSelect('status');
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
                {selectedFilters?.status2 && selectedFilters.status2.length > 0
                  ? 'Filtradas'
                  : 'Todos'}
                <ArrowDown />
              </button>
              {activeModal === 'status2' && (
                <div className="modal-filter">
                  <ul>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="status2"
                          value="apagar"
                          onChange={(e) => {
                            onFilterChange(e);
                            handleModalSelect('status2');
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
                            handleModalSelect('status2');
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
                            handleModalSelect('status2');
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
                {selectedFilters?.clienteId
                  ? clientes.find((cliente) => cliente.id === parseInt(selectedFilters.clienteId))?.nomeFantasia || 'Cliente não encontrado'
                  : 'Todos'}
                <ArrowDown />
              </button>
              {activeModal === 'cliente' && (
                <div className="modal-filter">
                  <h5>Escolha o cliente</h5>
                  <input
                    type="text"
                    placeholder="Digite"
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
                              onFilterChange(e);
                              handleModalSelect('cliente');
                            }}
                            value={cliente.id}
                            checked={selectedFilters.clienteId === String(cliente.id)}
                          />
                          {cliente.nomeFantasia}
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
                {selectedFilters?.fornecedorId
                  ? fornecedores.find(fornecedor => fornecedor.id === parseInt(selectedFilters.fornecedorId))?.nomeFantasia || 'Fornecedor não encontrado'
                  : 'Todos'}
                <ArrowDown />
              </button>
              {activeModal === 'fornecedor' && (
                <div className="modal-filter">
                  <h5>Escolha o fornecedor</h5>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={searchfornecedor}
                    onChange={handleFornecedorSearch}
                  />
                  <ul>
                    {filteredFornecedores.map(fornecedor => (
                      <li key={fornecedor.id}>
                        <label>
                          <input
                            type="checkbox"
                            name="fornecedor"
                            onChange={(e) => {
                              onFilterChange(e);
                              handleModalSelect('fornecedor');
                            }}
                            value={fornecedor.id}
                            checked={selectedFilters.fornecedorId === String(fornecedor.id)}
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


          {/* Filtro para exibir somente faturas */}
          {filterConfig.exibirFaturas && (
            <div className="form-group input-checkbox">
              <label>
                <input type="checkbox" name="faturas" onChange={onFilterChange} />
                Exibir somente faturas
              </label>
            </div>
          )}


          {/* Filtro por situação da nota fiscal */}
          {filterConfig.situacaoNF && (
            <div className="form-group">
              <h5>Situação</h5>
              <button onClick={() => toggleModal('situacaoNF')}>
                Todos <ArrowDown />
              </button>
              {activeModal === 'situacaoNF' && (
                <div className="modal-filter">
                  <h5>Situação</h5>
                  <ul>
                    <li><label><input type="checkbox" id="processamento" /> Processamento</label></li>
                    <li><label><input type="checkbox" id="emitido" /> Emitido</label></li>
                    <li><label><input type="checkbox" id="cancelado" /> Cancelado</label></li>
                    <li><label><input type="checkbox" id="pendente" /> Pendente</label></li>
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
