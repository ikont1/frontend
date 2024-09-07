import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './Carteira.css';
import { BiWallet, BiSolidZap, BiLike } from 'react-icons/bi';
import { useWallet } from '../../context/WalletContext';
import IntegracaoModal from '../../components/Modal/integracaoModal';

const bancoLogos = {
  '001': require('../../assets/imgs/bbLogo.png'),
  '237': require('../../assets/imgs/bradescologo.png'),
  '341': require('../../assets/imgs/itaulogo.png'),
  '260': require('../../assets/imgs/nubanklogo.png'),
  '104': require('../../assets/imgs/caixalogo.png'),
  '403': require('../../assets/imgs/coraLogo.png'),
};

const DetalhesConta = () => {
  const { id } = useParams();  // Pega o ID da conta da URL
  const { listarContas, listarExtrato } = useWallet();

  const [conta, setConta] = useState(null);
  const [extrato, setExtrato] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <h3><BiWallet className='walet-icon' /> Contas e Carteiras</h3>

          <div className="detalhes-header">
            <img src={conta.bancoLogo} alt="Banco Logo" className="banco-logo" />
            <div className="banco-info-detalhes">
              <h3>{conta.nomeBanco}</h3>
              <div className="banco-dados-detalhes">
                <span className="agencia">{conta.agencia}</span>
                <span className="conta">{`${conta.numeroConta}-${conta.contaDV}`}</span>
                <p>R${conta.saldoInicial}</p>
              </div>
            </div>

            <button className="integrar-button" onClick={handleIntegrarClick}><BiSolidZap className='icon' /> Integrar</button>
          </div>

          <div className="saldo-atual">
            <span>Saldo atual</span>
            <h2>R${conta.saldoInicial}</h2>
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
                {extrato.length > 0 ? (
                  extrato.map((transacao, index) => (
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
          </div>

        </div>
        <Link to="/conciliacao-financeira">
          <button className="resolv-conciliacao"><BiLike className='icon' /> Resolver conciliações</button>
        </Link>
      </div>

      {/* Modal de integração */}
      <IntegracaoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        conta={conta}
        onConfirm={handleConfirmIntegracao}
      />
    </div >
  );
};

export default DetalhesConta;
