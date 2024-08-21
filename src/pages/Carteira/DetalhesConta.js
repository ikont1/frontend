import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  const { id } = useParams();
  const { listarContas } = useWallet();
  const [conta, setConta] = useState(null);
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

    fetchConta();
  }, [id, listarContas]);

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
                <span className="conta">{conta.numeroConta}</span>
                <p>R${conta.saldoInicial}</p>
              </div>
            </div>

            <button className="integrar-button" onClick={handleIntegrarClick}><BiSolidZap className='icon' /> Integrar</button>
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
        <button className="resolv-conciliacao"><BiLike className='icon' /> Resolver conciliações</button>
      </div>

      {/* Modal de integraçao */}
      <IntegracaoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        conta={conta}
        onConfirm={handleConfirmIntegracao}
      />
    </div>
  );
};

export default DetalhesConta;
