import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './Dashboard.css';
import { BiWallet, BiBarChartAlt } from 'react-icons/bi';
import { FileText, ArrowRightCircle } from 'react-feather';
import { useWallet } from '../../context/WalletContext';
import { useFinance } from '../../context/FinanceContext';
import { useNf } from '../../context/nfContext';


const Dashboard = () => {
  const { listarContas, listarExtrato } = useWallet();
  const { fetchContasAReceber, fetchContasAPagar, contasAPagar, contasAReceber } = useFinance();
  const { fetchNfs } = useNf();
  const [contas, setContas] = useState([]);
  const [conciliadas, setConciliadas] = useState(0);
  const [pendentes, setPendentes] = useState(0);
  const [totalSaldoInicial, setTotalSaldoInicial] = useState(0); // Estado para armazenar o total dos saldos iniciais
  const [notasRecentes, setNotasRecentes] = useState([]);

  const bancoLogos = {
    '001': require('../../assets/imgs/bbLogo.png'),
    '237': require('../../assets/imgs/bradescologo.png'),
    '341': require('../../assets/imgs/itaulogo.png'),
    '260': require('../../assets/imgs/nubanklogo.png'),
    '104': require('../../assets/imgs/caixalogo.png'),
    '403': require('../../assets/imgs/coraLogo.png'),
    '077': require('../../assets/imgs/interLogo.png'),

  };

  // Lista todas as contas bancarias
  const fetchContas = useCallback(async () => {
    try {
      const response = await listarContas();
      setContas(response || []);

      // Soma dos saldos iniciais
      const totalSaldo = response.reduce((total, conta) => total + parseFloat(conta.saldoInicial || 0), 0);
      setTotalSaldoInicial(totalSaldo);

    } catch (error) {
      console.error('Erro ao buscar contas:', error);
    }
  }, [listarContas]);

  // Lista todas as contas a receber
  const fetchAReceber = useCallback(async () => {
    try {
      await fetchContasAReceber();
    } catch (error) {
      console.error('Erro ao buscar contas a receber:', error);
    }
  }, [fetchContasAReceber]);

  // Lista todas as contasa pagar
  const fetchAPagar = useCallback(async () => {
    try {
      await fetchContasAPagar();
    } catch (error) {
      console.error('Erro ao buscar contas a pagar:', error);
    }
  }, [fetchContasAPagar]);

  // Contagem de transações conciliadas e pendentes
  const contarTransacoes = useCallback(async () => {
    try {
      const todasContas = await listarContas();
      let totalConciliadas = 0;
      let totalPendentes = 0;

      // Iterar sobre cada conta para buscar os extratos
      for (const conta of todasContas) {
        const extrato = await listarExtrato(conta.id);
        totalConciliadas += extrato.filter(transacao => transacao.conciliacaoStatus === 'conciliado').length;
        totalPendentes += extrato.filter(transacao => transacao.conciliacaoStatus === 'naoConciliado').length;
      }

      setConciliadas(totalConciliadas);
      setPendentes(totalPendentes);

    } catch (error) {
      console.error('Erro ao contar transações:', error);
    }
  }, [listarContas, listarExtrato]);

  useEffect(() => {
    const fetchAndSortContas = async () => {
      await fetchContas();
      await fetchAReceber();
      await fetchAPagar();
      // Carregar notas fiscais recentes
      const carregarNotas = async () => {
        const todasNotas = await fetchNfs();
        if (todasNotas && Array.isArray(todasNotas)) {
          const ordenadas = [...todasNotas].sort((a, b) => new Date(b.dhEmi) - new Date(a.dhEmi));
          setNotasRecentes(ordenadas.slice(0, 5));
        }
      };
      await carregarNotas();
      await contarTransacoes(); // Contar transações ao carregar a página
    };
    fetchAndSortContas();
  }, [fetchContas, fetchAReceber, fetchAPagar, contarTransacoes, fetchNfs]);

  // Calcular a proporção das transações para o gráfico
  const conciliadasPercent = conciliadas + pendentes > 0 ? (conciliadas / (conciliadas + pendentes)) * 100 : 0;


  // Mostra as ontas recentes
  const sortedContasAReceber = [...contasAReceber].sort((a, b) => new Date(b.vencimento) - new Date(a.vencimento));
  const sortedContasAPagar = [...contasAPagar].sort((a, b) => new Date(b.vencimento) - new Date(a.vencimento));

  // Conta dias em atraso
  const calculateDaysOverdue = (vencimento, status) => {
    if (status === 'pago') return null;

    const today = new Date();
    const dueDate = new Date(vencimento);
    const timeDiff = today - dueDate;

    if (timeDiff > 0) {
      const daysOverdue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return daysOverdue;
    }

    return null;
  };



  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className='container-dashboard'>
          <div className='sections-cards-dash'>

            <div className='cards-left'>
              <h4><BiWallet className='icon' />Conta e carteira <Link to='/carteira' className='i'><ArrowRightCircle /></Link></h4>
             
              <div className='totalContas'>
                <h5>Saldo total das contas</h5>
                <span>R$ {totalSaldoInicial.toLocaleString()}</span>
              </div>

              <div className="card-conta">
                {contas.length > 0 ? (
                  contas
                    .filter(conta => conta.contaPrincipal === true)
                    .map(conta => (
                      <div key={conta.id}>
                        <div className="card-header">
                          <img src={bancoLogos[conta.codigoBanco] || bancoLogos['default']} alt="Banco Logo" className="banco-logo" />
                          <div className="banco-info">
                            {conta.status === 'inativo' && <span className="flag-inativa">Conta inativa</span>}
                            <h3>{conta.nomeBanco}</h3>
                            <div className="banco-dados">
                              <span className="agencia">{conta.agencia}</span>
                              <span className="conta">{`${conta.numeroConta}-${conta.contaDV}`}</span>
                            </div>
                          </div>
                          <div className="saldo saldo-tooltip">
                            <span className="saldo-label">R$ {parseFloat(conta.saldoInicial).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="card-footer">
                          <div className="saldo-total">
                            <span>Saldo total</span>
                            <span className="span-total">R$ {parseFloat(conta.saldoInicial).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p>Nenhuma conta cadastrada.</p>
                )}
              </div>

              <div className='card-conciliacao'>
                <h4><BiBarChartAlt className='icon' /> Status das conciliações</h4>
                <div className='grafico-conciliacao'>
                  <div className='legenda'>
                    <div className='legenda-item'>
                      <span className='dot conciliadas-dot'></span> {conciliadas} Conciliadas
                    </div>
                    <div className='legenda-item'>
                      <span className='dot pendentes-dot'></span> {pendentes} Pendentes
                    </div>
                  </div>

                  <div className='grafico'
                    style={{
                      background: `conic-gradient(rgb(1, 221, 1, 1) 0% ${conciliadasPercent}%, rgb(235, 0, 0, 0.8) ${conciliadasPercent}% 100%)`
                    }}>
                  </div>
                </div>

                <Link to='/conciliacao-financeira'>Ver todas as pendentes <ArrowRightCircle className='icon' /></Link>
              </div>

            </div>

            <div className='cards-right'>
              <div className='card-areceber'>
                <h4><BiWallet className='icon' />A receber <Link to='/contas-receber' className='i'><ArrowRightCircle /></Link></h4>
                <div className='conteudo'>
                  {sortedContasAReceber.length > 0 ? (
                    sortedContasAReceber.slice(0, 3).map(conta => {
                      const daysOverdue = calculateDaysOverdue(conta.vencimento, conta.status);
                      return (
                        <div key={conta.id} className='conta'>
                          <div>
                            <p>{new Date(conta.vencimento).toLocaleDateString()}</p>
                            {daysOverdue !== null && <span className='dias-vencido'>Venceu há {daysOverdue} dias</span>}
                          </div>
                          <div>
                            <p>{conta.descricao}</p>
                            <p>R${conta.valor}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>Nenhuma conta a receber.</p>
                  )}
                  <div className='total'>
                    <p>Total</p>
                    <span>
                      R${(contasAReceber.reduce((total, conta) => total + conta.valor, 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className='card-apagar'>
                <h4><BiWallet className='icon' />A pagar <Link to='/contas-pagar' className='i'><ArrowRightCircle /></Link></h4>
                <div className='conteudo'>
                  {sortedContasAPagar.length > 0 ? (
                    sortedContasAPagar.slice(0, 3).map(conta => {
                      const daysOverdue = calculateDaysOverdue(conta.vencimento, conta.status);
                      return (
                        <div key={conta.id} className='conta'>
                          <div>
                            <p>{new Date(conta.vencimento).toLocaleDateString()}</p>
                            {daysOverdue !== null && <span className='dias-vencido'>Venceu há {daysOverdue} dias</span>}
                          </div>
                          <div>
                            <p>{conta.descricao}</p>
                            <p>R${conta.valor}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>Nenhuma conta a pagar.</p>
                  )}
                  <div className='total'>
                    <p>Total</p>
                    <span>
                      R${(contasAPagar.reduce((total, conta) => total + conta.valor, 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <div className='content content-table'>
            <div className='container-h3'>
              <h3><FileText className='icon' /> Notas fiscais recentes</h3>
              <Link to='/notas-fiscais'>Ver todas <ArrowRightCircle className='icon' /></Link>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Emitido em</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {notasRecentes.length > 0 ? (
                  notasRecentes.map(nf => (
                    <tr key={nf.id}>
                      <td>{nf.emitXNome || nf.nomeClienteFornecedor || 'Cliente não informado'}</td>
                      <td>{new Date(nf.dhEmi).toLocaleDateString()}</td>
                      <td>R${parseFloat(nf.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>Nenhuma nota fiscal recente.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
