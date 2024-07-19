import React, { useState } from 'react';
import './FilterBar.css';
import { Calendar, PlusCircle, Filter, ArrowDown, ChevronLeft, ChevronRight } from 'react-feather';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addMonths, subMonths, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

// Registrar a localização em português
registerLocale('pt-BR', ptBR);

const FilterBar = ({ onAdd, titleButton, filterConfig }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const toggleModal = (modal) => {
    setActiveModal(activeModal === modal ? null : modal);
  };

  const handlePrevMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  return (
    <div className='filter-bar-container'>
      <div className="filter-bar">

        {filterConfig.buttonAdd && (
          <button className="add-button-receber" onClick={onAdd}>
            <PlusCircle /> {titleButton}
          </button>
        )}

        <div className="filters">

          {filterConfig.competecia && (
            <select className="date-filter">
              <option>Competência</option>
              <option>Lorem</option>
              <option>Lorem</option>
            </select>
          )}

          {filterConfig.buttonMeses && (
            <div className="date-filter">
              <ChevronLeft className="icon-left" onClick={handlePrevMonth} />
              <Calendar /> {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
              <ChevronRight className="icon-right" onClick={handleNextMonth} />
            </div>
          )}

          {filterConfig.buttonPeriod && (
            <button className="period-button" onClick={toggleDatePicker}>
              <Calendar /> Selecionar período
            </button>
          )}

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
              <button onClick={() => setShowDatePicker(false)}>Aplicar</button>
            </div>
          )}
        </div>
      </div>

      <div className='container-filtrar-pesquisar'>
        <button className="filter-button" onClick={toggleFilters}>
          <Filter /> Filtrar
        </button>
      </div>

      {showFilters && (
        <div className="advanced-filters">
          {filterConfig.categoria && (
            <div className="form-group">
              <h5>Categoria</h5>
              <button onClick={() => toggleModal('categoria')}>
                Todos <ArrowDown />
              </button>
              {activeModal === 'categoria' && (
                <div className="modal-filter">
                  <span>Aplicação financeira</span>
                  <ul>
                    <li><label><input type="checkbox" id="aplicacao-financeira" /> Aplicação financeira</label></li>
                    <li><label><input type="checkbox" id="rendimento-aplicacao-financeira" /> Rendimento de aplicação financeira</label></li>
                    <li><label><input type="checkbox" id="resgate-aplicacao-financeira" /> Resgate de aplicação financeira</label></li>
                  </ul>
                  <span>Aporte de sócio</span>
                  <ul>
                    <li><label><input type="checkbox" id="aporte-socio" /> Aporte de sócio</label></li>
                  </ul>
                  <span>Ativo imobilizado</span>
                  <ul>
                    <li><label><input type="checkbox" id="venda-imobilizado" /> Venda de imobilizado</label></li>
                  </ul>
                  <span>Cliente</span>
                  <ul>
                    <li><label><input type="checkbox" id="adiantamento-cliente" /> Adiantamento de cliente</label></li>
                  </ul>
                </div>
              )}
            </div>
          )}

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
                    <li><label><input type="checkbox" id="a-receber" /> A receber</label></li>
                    <li><label><input type="checkbox" id="recebido" /> Recebido</label></li>
                    <li><label><input type="checkbox" id="vencido" /> Vencido</label></li>
                  </ul>
                </div>
              )}
            </div>
          )}

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
                    <li><label><input type="checkbox" id="a-pagar" /> A pagar</label></li>
                    <li><label><input type="checkbox" id="pago" /> Pago</label></li>
                    <li><label><input type="checkbox" id="vencido" /> Vencido</label></li>
                  </ul>
                </div>
              )}
            </div>
          )}

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

          {filterConfig.cliente && (
            <div className="form-group">
              <h5>Cliente</h5>
              <button onClick={() => toggleModal('cliente')}>
                Todos <ArrowDown />
              </button>
              {activeModal === 'cliente' && (
                <div className="modal-filter">
                  <h5>Escolha o cliente</h5>
                  <input type="text" placeholder="Digite" />
                  <ul>
                    <li><label><input type="checkbox" id="solar-energia" /> SOLAR ENERGIA LTDA</label></li>
                    <li><label><input type="checkbox" id="ag-construcao" /> AG CONSTRUÇÃO EIRELI</label></li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {filterConfig.exibirFaturas && (
            <div className="form-group input-checkbox">
              <label><input type="checkbox" name="faturas" /> Exibir somente faturas</label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;