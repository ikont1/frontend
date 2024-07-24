import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './Carteira.css';
import { BiWallet, BiSolidZap } from 'react-icons/bi';
import { useWallet } from '../../context/WalletContext';
import bancoLogo from '../../assets/imgs/bbLogo.png';


const DetalhesConta = () => {
  const { id } = useParams();
  const { listarContas } = useWallet();
  const [conta, setConta] = useState(null);

  useEffect(() => {
    const fetchConta = async () => {
      try {
        const contasData = await listarContas();
        const contaEncontrada = contasData.find(conta => conta.id === parseInt(id));
        setConta(contaEncontrada);
      } catch (error) {
        console.error('Erro ao buscar conta:', error);
      }
    };

    fetchConta();
  }, [id, listarContas]);

  if (!conta) {
    return (
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <p>Nenhuma conta não encontrada...</p >
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
            <img src={bancoLogo} alt="Banco Logo" className="banco-logo" />
            <div className="banco-info-detalhes">
              <h3>{conta.nomeBanco}</h3>
              <div className="banco-dados-detalhes">
                <span className="agencia">{conta.agencia}</span>
                <span className="conta">{conta.numeroConta}</span>

                <p>R${conta.saldoInicial}</p>
              </div>
            </div>

            <button className="integrar-button"><BiSolidZap className='icon'/> Integrar</button>
          </div>

          <div className="saldo-atual">
            <span>Saldo atual</span>
            <h2>R${conta.saldoInicial}</h2>
          </div>

          <div className='content content-table'>
            <table className="table">
              <thead>
                <tr>
                  <th>Últimas tranzações</th>
                  <th>Status</th>
                  <th>Emitido em</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jardinaria campo belo</td>
                  <td >Conciliação pendente</td>
                  <td>2024/03/21</td>
                  <td>+ R$4.500,00</td>
                </tr>
                <tr>
                  <td>Jardinaria campo belo</td>
                  <td >Conciliação pendente</td>
                  <td>2024/03/21</td>
                  <td>+ R$4.500,00</td>
                </tr>
                <tr>
                  <td>Jardinaria campo belo</td>
                  <td >Conciliação pendente</td>
                  <td>2024/03/21</td>
                  <td>+ R$4.500,00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalhesConta;