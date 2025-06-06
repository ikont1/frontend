import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './Carteira.css';
import { BiWallet, BiSolidZap, BiLike, } from 'react-icons/bi';
import { ArrowLeft, ArrowRight } from 'react-feather';
import { useWallet } from '../../context/WalletContext';
import IntegracaoModal from '../../components/Modal/integracaoModal';
import ConfirmationModal from '../../components/Modal/confirmationModal';
import RedirectButton from '../../components/RedirectButton';

const bancoLogos = {
  '001': require('../../assets/imgs/bbLogo.png'),
  '237': require('../../assets/imgs/bradescologo.png'),
  '341': require('../../assets/imgs/itaulogo.png'),
  '260': require('../../assets/imgs/nubanklogo.png'),
  '104': require('../../assets/imgs/caixalogo.png'),
  '403': require('../../assets/imgs/coraLogo.png'),
  '077': require('../../assets/imgs/interLogo.png'),
};

const DetalhesConta = () => {
  const { id } = useParams();
  const { listarContas, listarExtrato, desconectarConta, atualizarContaBancaria } = useWallet();

  const [conta, setConta] = useState(null);
  const [extrato, setExtrato] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);

  useEffect(() => {
    const fetchConta = async () => {
      try {
        const contasData = await listarContas();
        const contaEncontrada = contasData.find(conta => conta.id === parseInt(id));
        if (contaEncontrada) {
          contaEncontrada.bancoLogo = bancoLogos[contaEncontrada.codigoBanco] || bancoLogos['default'];
        }
        setConta(contaEncontrada);
      } catch (error) {
        console.error('Erro ao buscar conta:', error);
      }
    };

    const fetchExtrato = async () => {
      try {
        const extratoData = await listarExtrato(id);
        setExtrato(extratoData);
      } catch (error) {
        console.error('Erro ao buscar extrato:', error);
      }
    };

    fetchConta();
    fetchExtrato();
  }, [id, listarContas, listarExtrato]);

  const handleIntegrarClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmIntegracao = () => {
    // Lógica de confirmação de integração
    console.log('Integração confirmada');
    setIsModalOpen(false);
  };

  const handleDesconectarClick = () => {
    setIsConfirmModalOpen(true); // Abrir modal de confirmação
  };

  const handleConfirmDesconectar = async () => {
    try {
      await desconectarConta(id);
      setIsConfirmModalOpen(false);
      setConta(prev => ({ ...prev, conectada: false }));
    } catch (error) {
      console.error('Erro ao desconectar conta:', error);
    }
  }

  // Paginacao
  const paginarItens = (itens, pagina, itensPorPagina) => {
    const inicio = (pagina - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return itens.slice(inicio, fim);
  };

  const itensPaginados = paginarItens(extrato, paginaAtual, itensPorPagina);
  const totalPaginas = Math.ceil(extrato.length / itensPorPagina);

  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
  };

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
  };

  // visualizacao da tabela
  const renderStatus = (status) => {
    switch (status) {
      case 'conciliado':
        return 'Conciliado';
      case 'naoConciliado':
        return 'Conciliação pendente';
      case 'sugestao':
        return 'Sugestão';
      default:
        return status;
    }
  };

  if (!conta) {
    return (
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <p>Nenhuma conta encontrada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="container-carteira">
          <div className='h3-icon'>
            <h3><BiWallet className='walet-icon' /> Detalhes da Conta </h3>
            <RedirectButton route='/carteira' tooltipText='Voltar para carteira' />
          </div>

          <div className="detalhes-header">
            <img src={conta.bancoLogo} alt="Banco Logo" className="banco-logo" />
            <div className="banco-info-detalhes">
              <h3>{conta.nomeBanco}</h3>
              <div className="banco-dados-detalhes">
                <div>
                  <span className="agencia">{conta.agencia}</span>
                  <span className="conta">{`${conta.numeroConta}-${conta.contaDV}`}</span>
                </div>
                <p>R${parseFloat(conta.saldoInicial).toLocaleString()}</p>
              </div>
            </div>

            {conta.integrado ?
              (
                <div className="tooltip-status-container">
                  <div className="tooltip-container2">
                    <button className="integrada-button" onClick={handleDesconectarClick}>
                      <BiSolidZap className='icon' /> Integrada
                    </button>
                    <span className="tooltipStatus">
                      {conta.integradoComCobranca
                        ? 'Integrado com extrato e cobrança BB'
                        : 'Integrado com extrato BB'}
                    </span>
                  </div>
                </div>
              ) : (
                <button className="integrar-button" onClick={handleIntegrarClick}><BiSolidZap className='icon' /> Integrar</button>
              )}
          </div>

          <div className="saldo-atual">
            <div>
              <span>Saldo atual</span>
              <h2>R${parseFloat(conta.saldoInicial).toLocaleString()}</h2>
            </div>
            <div className="conta-principal">
              <span>Conta Principal</span>
              <div className="switch-container">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={conta.contaPrincipal}
                    onChange={async (e) => {
                      const isPrincipal = e.target.checked;

                      try {
                        await atualizarContaBancaria(conta.id, conta, isPrincipal);

                        // Atualiza o estado local para refletir a mudança visual
                        setConta((prevConta) => ({ ...prevConta, contaPrincipal: isPrincipal }));

                        // Opcional: Recarrega as contas para garantir consistência
                        await listarContas();
                      } catch (err) {
                        console.error("Erro ao atualizar a conta bancária:", err);
                      }
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className='content content-table table-extrato'>
            <table className="table">
              <thead>
                <tr>
                  <th>Últimas transações</th>
                  <th>Status</th>
                  <th></th>
                  <th>Emitido em</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {itensPaginados.length > 0 ? (
                  itensPaginados.map((transacao, index) => (
                    <tr key={index}>
                      <td className='td-transacao-extrato' data-label="Últimas transações">{transacao.descricao}</td>
                      <td
                        className={`td-statu-extrato ${transacao.conciliacaoStatus === 'conciliado'
                          ? 'status-conciliado'
                          : transacao.conciliacaoStatus === 'naoConciliado'
                            ? 'status-naoConciliado'
                            : 'status-sugestao'
                          }`}
                        data-label="Status"
                      >
                        <span>{renderStatus(transacao.conciliacaoStatus)}</span>
                      </td>
                      <td></td>
                      <td className='td-data-extrato' data-label="Emitido em"><span>{new Date(transacao.dataTransacao).toLocaleDateString()}</span></td>
                      <td
                        className={`td-valor-extrato ${transacao.conciliacaoStatus === 'naoConciliado' ? 'valor-naoConciliado' : ''
                          }`}
                        data-label="Valor"
                      >
                        {`R$ ${transacao.valor.toFixed(2)}`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">Nenhum dado a ser mostrado</td>
                  </tr>
                )}
              </tbody>
            </table>

            <Link to="/conciliacao-financeira">
              <button className="resolv-conciliacao"><BiLike className='icon' /> Resolver conciliações</button>
            </Link>
          </div>

          {/* Controle de paginação */}
          <div className="paginacao-container">
            <div className="paginacao-texto">
              <span>Itens por página:</span>
              <select
                value={itensPorPagina}
                onChange={(e) => {
                  const novosItensPorPagina = parseInt(e.target.value);
                  setItensPorPagina(novosItensPorPagina);
                  setPaginaAtual(1); // Reiniciar para a primeira página
                }}
                className="itens-por-pagina"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="paginacao-detalhes">
              <button
                onClick={handlePaginaAnterior}
                disabled={paginaAtual === 1}
                className="botao-paginacao"
              >
                <ArrowLeft className="seta-icon" />
              </button>
              <span>{`${paginaAtual} de ${totalPaginas}`}</span>
              <button
                onClick={handleProximaPagina}
                disabled={paginaAtual === totalPaginas}
                className="botao-paginacao"
              >
                <ArrowRight className="seta-icon" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Modal de integração */}
      <IntegracaoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        conta={conta}
        onConfirm={handleConfirmIntegracao}
      />
      {/* Modal de Confirmação */}
      {
        isConfirmModalOpen && (
          <ConfirmationModal
            title="Confirmação de Desconexão"
            message="Tem certeza de que deseja desconectar esta conta?"
            secondaryMessage="Essa ação interromperá a integração automática."
            onConfirm={handleConfirmDesconectar}
            onCancel={() => setIsConfirmModalOpen(false)}
          />
        )
      }
    </div >
  );
};

export default DetalhesConta;
