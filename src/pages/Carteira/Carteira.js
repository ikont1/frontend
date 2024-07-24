import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './Carteira.css';
import { BiWallet } from 'react-icons/bi';
import bancoLogo from '../../assets/imgs/bbLogo.png';
import { PlusCircle } from 'react-feather';
import { useWallet } from '../../context/WalletContext';

const Carteira = () => {
  const { listarContas } = useWallet();
  const [contas, setContas] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const navigate = useNavigate();

  // função para o tooltip de opcoes
  const handleTooltipToggle = (id) => {
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  // Visualizar dados da conta
  const handleViewAccount = (id) => {
    navigate(`/conta/${id}`);
  };

  // Desativar conta
  const handleDeactivateAccount = (id) => {
    console.log(`Desativar conta ${id}`);
    // Lógica para desativar a conta
  };

  // Lista todas as contas
  const fetchContas = useCallback(async () => {
    try {
      const contasData = await listarContas();
      setContas(contasData);
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
    }
  }, [listarContas]);

  useEffect(() => {
    fetchContas();
  }, [fetchContas]);

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className='container-carteira'>
          <h3><BiWallet className='walet-icon' /> Contas e Carteiras</h3>

          <div className='contas'>
            {contas > 0 ? (
              <p></p>
            ) : (
              contas.map(conta => (
                <div className="card-conta" key={conta.id}>
                  <div className="card-header">
                    <img src={bancoLogo} alt="Banco Logo" className="banco-logo" />
                    <div className="banco-info">
                      <h3>{conta.nomeBanco}</h3>
                      <div className="banco-dados">
                        <span className="agencia">{conta.agencia}</span>
                        <span className="conta">{conta.numeroConta}</span>
                      </div>
                    </div>
                    <div className='saldo saldo-tooltip'>
                      <h1 className='menu-icon-conta' onClick={() => handleTooltipToggle(conta.id)}>...</h1>
                      {activeTooltip === conta.id && (
                        <div className="tooltip-carteira">
                          <ul>
                            <li onClick={() => handleViewAccount(conta.id)}>Visualizar conta</li>
                            <li onClick={() => handleDeactivateAccount(conta.id)}>Desativar conta</li>
                          </ul>
                        </div>
                      )}
                      <span className="saldo-label">R${conta.saldoInicial}</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="saldo-total">
                      <span>Saldo total</span>
                      <span className='span-total'>R${conta.saldoInicial}</span>
                    </div>
                  </div>
                </div>
              ))
            )}


            <div className="card-conta add-conta">
              <div className="overlay">
                <button className="add-button-conta">
                  <span className="plus-icon"><PlusCircle /> </span> Criar conta
                </button>
              </div>
              <div className="card-header">
                <div className="banco-logo-placeholder"></div>
                <div className="banco-info">
                  <h3>Nome da conta</h3>
                  <div className="banco-dados">
                    <span className="agencia">0000</span>
                    <span className="conta">0000000</span>
                  </div>
                </div>
                <div className='saldo'>
                  <span className="saldo-label">R$00,00</span>
                </div>
              </div>
              <div className="card-footer">
                <div className="saldo-total">
                  <span>Saldo</span>
                  <span className='span-total'>R$00,00</span>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Carteira;
