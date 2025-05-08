import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import FilterBar from '../../components/FilterBar/FilterBar';
import './NotasFiscais.css';
import { FileText } from 'react-feather';
import { parseISO, format, isValid } from 'date-fns';

import { useNf } from '../../context/nfContext';
import ConfirmationModal from '../../components/Modal/confirmationModal';

const NotasFiscais = () => {
	const { fetchNfs, ativarMonitoramento, desativarMonitoramento, statusMonitoramento } = useNf();
	const [notasFiscais, setNotasFiscais,] = useState([]);
	const [monitoramentoId, setMonitoramentoId] = useState(null);
	const [monitoramentoAtivo, setMonitoramentoAtivo] = useState(false);
	const [acaoMonitoramento, setAcaoMonitoramento] = useState('');
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	useEffect(() => {
		const loadNfs = async () => {
			const data = await fetchNfs();
			if (data) setNotasFiscais(data);
			const statusData = await statusMonitoramento();
			if (statusData && statusData.data) {
				setMonitoramentoAtivo(statusData.data.monitoramentoAtivo);
			}
		};
		loadNfs();
	}, [fetchNfs, statusMonitoramento]);

	const handleMonitoramentoClick = (id, acao) => {
		setMonitoramentoId(id);
		setAcaoMonitoramento(acao);
		setShowConfirmModal(true);
	};

	const confirmarMonitoramento = async () => {
		if (acaoMonitoramento === 'ativar') {
			await ativarMonitoramento(monitoramentoId);
		} else if (acaoMonitoramento === 'desativar') {
			await desativarMonitoramento(monitoramentoId);
		}
		// Atualiza o status após a ação
		const statusData = await statusMonitoramento();
		if (statusData && statusData.data) {
			setMonitoramentoAtivo(statusData.data.monitoramentoAtivo);
		}
		setShowConfirmModal(false);
	};


	// Formatar a data
	const formatDate = (dateString) => {
		if (!dateString) return 'Data inválida';
		const parsedDate = parseISO(dateString);
		if (!isValid(parsedDate)) {
			return 'Data inválida';
		}
		return format(parsedDate, 'dd/MM/yyyy');
	};

	// Formatar valor
	const formatValue = (value) => {
		const numberValue = typeof value === 'number' ? value : parseFloat(value);
		if (isNaN(numberValue)) return '0,00';
		return numberValue.toLocaleString('pt-BR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
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
					<div style={{ boxShadow: 'none' }} className="saldo-atual">
						<h1><FileText style={{ color: 'var(--primary-color)' }} /> Notas fiscais recentes</h1>
						<div className="conta-principal">
							<span>Monitoramento</span>
							<div className="switch-container">
								<label className="switch-label">
									<input
										type="checkbox"
										checked={monitoramentoAtivo}
										onChange={(e) => handleMonitoramentoClick(
											null,
											e.target.checked ? 'ativar' : 'desativar'
										)}
									/>
									<span className="slider"></span>
								</label>
							</div>
						</div>
					</div>

					<table className="table">
						<thead>
							<tr>
								<th>Nº/Série</th>
								<th>Emissão</th>
								<th>Cliente</th>
								<th>Situação</th>
								<th>Valor</th>
							</tr>
						</thead>
						<tbody>
							{notasFiscais.map((notas, index) => (
								<tr key={index}>
									<td>{notas.nNF}</td>
									<td>{formatDate(notas.dhEmi)}</td>
									<td className='td-transacao-extrato'>{notas.destXNome}</td>
									<td style={{ textTransform: 'capitalize' }}>{notas.situacao}</td>
									<td>R${formatValue(notas.valorTotal)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{showConfirmModal && (
				<ConfirmationModal
				title={acaoMonitoramento === 'ativar' ? 'Confirmação de Ativação' : 'Confirmação de Desativação'}
				message={`Tem certeza de que deseja ${acaoMonitoramento} o monitoramento?`}
				secondaryMessage="Essa ação alterará o status do monitoramento das notas fiscais."
				onConfirm={confirmarMonitoramento}
				onCancel={() => setShowConfirmModal(false)}
			/>
			)}
		</div>
	);
};

export default NotasFiscais;
