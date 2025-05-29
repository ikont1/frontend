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
	const [notasFiscais, setNotasFiscais] = useState([]);
	const [monitoramentoId, setMonitoramentoId] = useState(null);
	const [monitoramentoAtivo, setMonitoramentoAtivo] = useState(false);
	const [acaoMonitoramento, setAcaoMonitoramento] = useState('');
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	// Estados para filtro
	const [clientesUnicos, setClientesUnicos] = useState([]);
	const [selectedFilters, setSelectedFilters] = useState({
		situacoes: [],
		clienteId: [],
		month: null,
		period: { start: null, end: null }
	});

useEffect(() => {
	const loadNfs = async () => {
		const currentDate = new Date();
		const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
		const data = await fetchNfs({
			periodo: `dhEmi:${startOfMonth.toISOString().split('T')[0]}|${endOfMonth.toISOString().split('T')[0]}`
		});
		if (data) {
			setNotasFiscais(data);

			const clientes = [
				...new Map(
					data.map(nf => ({
						id: nf.emitXNome || nf.emitCpfCnpj,
						nomeFantasia: nf.emitXNome,
						cpfCnpj: nf.emitCpfCnpj
					}))
					.map(c => [c.id, c])
				).values()
			];
			setClientesUnicos(clientes);
		}
		const statusData = await statusMonitoramento();
		if (statusData && statusData.data) {
			setMonitoramentoAtivo(statusData.data.monitoramentoAtivo);
		}
		// Atualiza filtro selecionado para preencher o mês atual
		setSelectedFilters(prev => ({
			...prev,
			month: currentDate.toISOString().split('T')[0]
		}));
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
		const statusData = await statusMonitoramento();
		if (statusData && statusData.data) {
			setMonitoramentoAtivo(statusData.data.monitoramentoAtivo);
		}
		setShowConfirmModal(false);
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'Data inválida';
		const parsedDate = parseISO(dateString);
		if (!isValid(parsedDate)) {
			return 'Data inválida';
		}
		return format(parsedDate, 'dd/MM/yyyy');
	};

	const formatValue = (value) => {
		const numberValue = typeof value === 'number' ? value : parseFloat(value);
		if (isNaN(numberValue)) return '0,00';
		return numberValue.toLocaleString('pt-BR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	// Função para lidar com alterações nos filtros do FilterBar
	const onFilterChange = (e) => {
		// e pode ser um evento ou um objeto customizado vindo do FilterBar
		if (e?.target?.name === 'resetFilters') {
			const currentDate = new Date();
			return setSelectedFilters({
				situacoes: [],
				clienteId: [],
				month: currentDate.toISOString().split('T')[0],
				period: { start: null, end: null }
			});
		}
		const { name, value, checked } = e.target || {};
		setSelectedFilters(prev => {
			let updated = { ...prev };
			if (name === 'situacaoNF') {
				const val = value;
				let situacoes = prev.situacoes || [];
				if (checked) {
					situacoes = [...situacoes, val];
				} else {
					situacoes = situacoes.filter(s => s !== val);
				}
				updated.situacoes = situacoes;
			} else if (name === 'cliente') {
				const val = value;
				let clienteId = prev.clienteId || [];
				if (checked) {
					clienteId = [...clienteId, val];
				} else {
					clienteId = clienteId.filter(c => c !== val);
				}
				updated.clienteId = clienteId;
			} else if (name === 'month') {
				updated.month = value;
			} else if (name === 'periodStart') {
				updated.period = { ...updated.period, start: value };
			} else if (name === 'periodEnd') {
				updated.period = { ...updated.period, end: value };
			}
			return updated;
		});
	};

	// Filtro das notas fiscais
	const notasFiltradas = notasFiscais.filter(nf => {
		// Situação
		const matchSituacao = selectedFilters.situacoes.length > 0 ? selectedFilters.situacoes.includes(nf.situacao) : true;
		// Cliente
		const matchCliente = selectedFilters.clienteId.length > 0 ? selectedFilters.clienteId.includes(nf.emitXNome) : true;
		// Mês
		let matchMonth = true;
		if (selectedFilters.month) {
			try {
				const nfDate = parseISO(nf.dhEmi);
				const filterMonth = parseISO(selectedFilters.month);
				matchMonth = nfDate.getMonth() === filterMonth.getMonth() && nfDate.getFullYear() === filterMonth.getFullYear();
			} catch {
				matchMonth = true;
			}
		}
		return matchSituacao && matchCliente && matchMonth;
	});

	return (
		<div className="container">
			<Sidebar />
			<div className="main-content">
				<Header />

				{/* Novo FilterBar para filtros avançados */}
				<FilterBar
					filterConfig={{
						situacaoNF: true,
						cliente: true,
						buttonMeses: true
					}}
					clientes={clientesUnicos}
					onFilterChange={onFilterChange}
					selectedFilters={selectedFilters}
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
						{notasFiltradas.length > 0 ? (
							notasFiltradas.map((notas, index) => (
								<tr key={index}>
									<td>{notas.nNF}/{notas.serie}</td>
									<td>{formatDate(notas.dhEmi)}</td>
									<td className='td-transacao-extrato'>{notas.emitXNome}</td>
									<td style={{ textTransform: 'capitalize' }}>{notas.situacao}</td>
									<td>R${formatValue(notas.valorTotal)}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="5" style={{ textAlign: 'center' }}>
									Nenhuma nota fiscal encontrada com esses filtros.
								</td>
							</tr>
						)}
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
