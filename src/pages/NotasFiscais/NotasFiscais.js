import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import FilterBar from '../../components/FilterBar/FilterBar';
import './NotasFiscais.css';
import { FileText } from 'react-feather';
import axios from 'axios';
import { parseISO, format, isValid } from 'date-fns';

const NotasFiscais = () => {
	const [notasFiscais, setNotasFiscais] = useState([]);

	// Função para buscar os dados da API
	const fetchNotasFiscais = useCallback(async () => {
		try {
			const response = await axios.get('http://localhost:3001/notasFiscais');
			setNotasFiscais(response.data);
		} catch (error) {
			console.error('Erro ao buscar dados', error);
		}
	}, []);

	// UseEffect para buscar os dados ao carregar o componente
	useEffect(() => {
		fetchNotasFiscais();
	}, [fetchNotasFiscais]);

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


	return (
		<div className="container">
			<Sidebar />
			<div className="main-content">
				<Header />

				<FilterBar
					filterConfig={{
						cliente: true,
						buttonMeses: true,
						buttonPesquisar: true,
						situacaoNF: true,
						competecia: true
					}}
				/>

				<div className='content content-table'>
					<h1><FileText style={{ color: 'var(--primary-color)' }} /> Notas fiscais recentes</h1>

					<table className="table">
						<thead>
							<tr>
								<th>Nº/Série</th>
								<th>Emissão</th>
								<th>Competência</th>
								<th>Cliente</th>
								<th>Situação</th>
								<th>Valor</th>
							</tr>
						</thead>
						<tbody>
							{notasFiscais.map((notas, index) => (
								<tr key={index}>
									<td>{notas.descricao}</td>
									<td>{formatDate(notas.dataEmisao)}</td>
									<td >{formatDate(notas.competencia)}</td>
									<td>{notas.cliente}</td>
									<td>{notas.situacao}</td>
									<td>R${formatValue(notas.valor)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default NotasFiscais;
