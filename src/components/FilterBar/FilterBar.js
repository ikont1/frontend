import React, { useState, useEffect } from 'react';
import './FilterBar.css';
import { Calendar, PlusCircle, Filter, ArrowDown, ChevronLeft, ChevronRight } from 'react-feather';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addMonths, subMonths, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

// Registrar a localização em português
registerLocale('pt-BR', ptBR);

const FilterBar = ({ onAdd, titleButton, filterConfig, categorias, clientes, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchCliente, setSearchCliente] = useState('');
  const [filteredClientes, setFilteredClientes] = useState(clientes || []);

  // Atualizar clientes filtrados quando a lista de clientes mudar
  useEffect(() => {
    setFilteredClientes(clientes);
  }, [clientes]);

  // Alternar exibição dos filtros
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Alternar exibição dos modais
  const toggleModal = (modal) => {
    setActiveModal(activeModal === modal ? null : modal);
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
  };

  // Filtrar clientes com base no texto digitado
  const handleClientSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchCliente(searchTerm);
    const filtered = clientes.filter(cliente =>
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
      </div>

      {/* Filtros avançados */}
      {showFilters && (
        <div className="advanced-filters">

          {/* Filtro por categoria */}
          {filterConfig.categoria && (
            <div className="form-group">
              <h5>Categoria</h5>
              <button onClick={() => toggleModal('categoria')}>
                Todos <ArrowDown />
              </button>
              {activeModal === 'categoria' && (
                <div className="modal-filter">
                  <ul>
                    {categorias.map(categoria => (
                      <li key={categoria}>
                        <label>
                          <input type="checkbox" name="categoria" onChange={onFilterChange} value={categoria} />
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
                Todos <ArrowDown />
              </button>
              {activeModal === 'status' && (
                <div className="modal-filter">
                  <h5>Status</h5>
                  <ul>
                    <li><label><input type="checkbox" name="status" onChange={onFilterChange} value="areceber" /> A receber</label></li>
                    <li><label><input type="checkbox" name="status" onChange={onFilterChange} value="recebido" /> Recebido</label></li>
                    <li><label><input type="checkbox" name="status" onChange={onFilterChange} value="vencido" /> Vencido</label></li>
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
                Todos <ArrowDown />
              </button>
              {activeModal === 'cliente' && (
                <div className="modal-filter">
                  <h5>Escolha o cliente</h5>
                  <input type="text" placeholder="Digite" value={searchCliente} onChange={handleClientSearch} />
                  <ul>
                    {filteredClientes.map(cliente => (
                      <li key={cliente.id}>
                        <label>
                          <input type="checkbox" name="cliente" onChange={onFilterChange} value={cliente.id} />
                          {cliente.nomeFantasia}
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

          {/* Filtro por status (contas a pagar) */}
          {filterConfig.status2 && (
            <div className="form-group">
              <h5>Status</h5>
              <button onClick={() => toggleModal('status2')}>
                Todos <ArrowDown />
              </button>
              {activeModal === 'status2' && (
                <div className="modal-filter">
                  <h5>Status</h5>
                  <ul>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="status2"
                          value="apagar"
                          onChange={onFilterChange}
                        /> A pagar
                      </label>
                    </li>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="status2"
                          value="pago"
                          onChange={onFilterChange}
                        /> Pago
                      </label>
                    </li>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          name="status2"
                          value="vencido"
                          onChange={onFilterChange}
                        /> Vencido
                      </label>
                    </li>
                  </ul>
                </div>
              )}
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
