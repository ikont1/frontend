import React from 'react';
import './FilterBarConciliacao.css'

const FilterBarConciliacao = ({ subTipoFiltro, startDate, endDate, categoriaSelecionada, descricaoFiltro, onFilterChange, isConciliadas }) => {
  return (
    <div className="filter-bar-conciliacao">
      <div className="filter-item">
        <label>Data Início</label>
        <input
          type="date"
          name="startDate"
          value={startDate || ''}
          onChange={onFilterChange}
        />
      </div>

      <div className="filter-item">
        <label>Data Fim</label>
        <input
          type="date"
          name="endDate"
          value={endDate || ''}
          onChange={onFilterChange}
        />
      </div>

      <div className="filter-item">
        <label>Categoria</label>
        <select name="categoria" value={categoriaSelecionada || ''} onChange={onFilterChange}>
          <option value="">Todas</option>
          <option value="a Pagar">{isConciliadas ? 'Pagos' : 'Contas a Pagar'}</option>
          <option value="a Receber">{isConciliadas ? 'Recebidos' : 'Contas a Receber'}</option>
        </select>
      </div>

      {/* Novo filtro de Tipo de Transação (Select) */}
      <div className="filter-item">
        <label htmlFor="subTipo">Tipo de Transação</label>
        <select
          id="subTipo"
          value={subTipoFiltro}
          onChange={(e) => onFilterChange({ target: { name: 'subTipo', value: e.target.value } })}        >
          <option value="">Todas</option>
          <option value="pix">PIX</option>
          <option value="boleto">Boleto</option>
          <option value="transferencia">Transferência</option>
          <option value="compraNoDebito">Compra no Débito</option>
          <option value="pagamentoFaturaCartao">Pagamento de Fatura</option>
          <option value="recargaCelular">Recarga de Celular</option>
          <option value="cobrancaBB">Cobrança BB</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      <div className="filter-item">
        <label>Descrição</label>
        <input
          type="text"
          name="descricao"
          placeholder="Buscar..."
          value={descricaoFiltro || ''}
          onChange={onFilterChange}
        />
      </div>
    </div>
  );
};

export default FilterBarConciliacao;
