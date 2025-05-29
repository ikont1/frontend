import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './Carteira.css';
import { BiWallet } from 'react-icons/bi';
import { PlusCircle } from 'react-feather';
import { useWallet } from '../../context/WalletContext';
import ConfirmationModal from '../../components/Modal/confirmationModal';
import RedirectButton from '../../components/RedirectButton';

const Carteira = () => {
  const { listarContas, excluirConta, desativarConta, reativarConta } = useWallet();
  const [contas, setContas] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedContaId, setSelectedContaId] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const navigate = useNavigate();



  const bancoLogos = {
    '001': require('../../assets/imgs/bbLogo.png'),
    '237': require('../../assets/imgs/bradescologo.png'),
    '341': require('../../assets/imgs/itaulogo.png'),
    '260': require('../../assets/imgs/nubanklogo.png'),
    '104': require('../../assets/imgs/caixalogo.png'),
    '403': require('../../assets/imgs/coraLogo.png'),
    '077': require('../../assets/imgs/interLogo.png'),

  };

  // função para o tooltip de opcões
  const handleTooltipToggle = (id) => {
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  // Visualizar dados da conta
  const handleViewAccount = (id) => {
    navigate(`/conta/${id}`);
  };

  // Excluir conta
  // const handleDeleteAccount = (id) => {
  //   setSelectedContaId(id);
  //   setModalAction('excluir');
  //   setShowModal(true);
  //   setActiveTooltip(null)
  // };

  // Desativar conta
  const handleDeactivateAccount = (id) => {
    setSelectedContaId(id);
    setModalAction('desativar');
    setShowModal(true);
    setActiveTooltip(null)
  };

  // Reativar conta
  const handleReactivateAccount = (id) => {
    setSelectedContaId(id);
    setModalAction('reativar');
    setShowModal(true);
    setActiveTooltip(null)
  };

  // Confirmar ação do modal
  const handleConfirmModal = async () => {
    setShowModal(false);
    try {
      if (modalAction === 'excluir') {
        await excluirConta(selectedContaId);
      } else if (modalAction === 'desativar') {
        await desativarConta(selectedContaId);
      } else if (modalAction === 'reativar') {
        await reativarConta(selectedContaId);
      }
      fetchContas();
    } catch (error) {
      console.error(`Erro ao ${modalAction} conta:`, error);
    }
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
          <div className='h3-icon'>
            <h3><BiWallet className='walet-icon' /> Contas e Carteiras </h3>
            <RedirectButton  route='/' tooltipText='Voltar para dashbord'/>
          </div>

          <div className='contas'>
            {contas.length > 0 ? (
              contas.map(conta => (
                <div className="card-conta" key={conta.id}>
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
                    <div className='saldo saldo-tooltip'>
                      <h1 className='menu-icon-conta' onClick={() => handleTooltipToggle(conta.id)}>...</h1>
                      {activeTooltip === conta.id && (
                        <div className="tooltip-carteira">
                          <ul>
                            {conta.status === 'ativo' ? (
                              <>
                                <li onClick={() => handleViewAccount(conta.id)}>Visualizar conta</li>
                                <li onClick={() => handleDeactivateAccount(conta.id)}>Desativar conta</li>
                              </>
                            ) : (
                              <>
                                <li onClick={() => handleReactivateAccount(conta.id)}>Reativar conta</li>
                                {/* <li onClick={() => handleDeleteAccount(conta.id)}>Excluir conta</li> */}
                              </>
                            )}
                          </ul>
                        </div>
                      )}
                      <span className="saldo-label">R${parseFloat(conta.saldoInicial).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="saldo-total">
                      <span>Saldo total</span>
                      <span className='span-total'>R${parseFloat(conta.saldoInicial).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhuma conta cadastrada.</p>
            )}

            <div className="card-conta add-conta" onClick={() => navigate('/cadastro-conta-bancaria')}>
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

      {showModal && (
        <ConfirmationModal
          title={modalAction === 'excluir' ? 'Excluir Conta' : modalAction === 'desativar' ? 'Desativar Conta' : 'Reativar Conta'}
          message={`Tem certeza que deseja ${modalAction} esta conta?`}
          onConfirm={handleConfirmModal}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Carteira;
