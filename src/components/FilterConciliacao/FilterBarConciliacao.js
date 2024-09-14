import React from 'react';
import './FilterBarConciliacao.css'

const FilterBarConciliacao = ({ categorias, startDate, endDate, categoriaSelecionada, descricaoFiltro, onFilterChange }) => {
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
          <option value="a Pagar">Contas a Pagar</option>
          <option value="a Receber">Contas a Receber</option>
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
