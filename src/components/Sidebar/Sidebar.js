import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, DollarSign, User, Users, Briefcase, Settings, HelpCircle, LogOut, Minimize2, Grid, BarChart2, ArrowDownLeft, ArrowUpRight, ArrowLeftCircle, ArrowRightCircle, Award, BookOpen } from 'react-feather';
import './Sidebar.css';
import logo from '../../assets/imgs/logosvg.svg';
import { useAuth } from '../../context/AuthContext';
import Permissao from '../../permissions/Permissao';
import ConfirmationModal from '../Modal/confirmationModal';
import Modal from '../Modal/Modal';
import { useAssinatura } from '../../context/AssinaturaContext';
import { useFinance } from '../../context/FinanceContext';


const Sidebar = () => {
  const { logout } = useAuth(); // Obtendo a função de logout do contexto
  const { cancelarAssinatura } = useAssinatura();
  const { convenio, fetchConvenio, addConvenio, deleteConvenio } = useFinance();

  const [isConciliacaoOpen, setIsConciliacaoOpen] = useState(false);
  const [isConfiguracaoOpen, setIsConfiguracaoOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfirmCancelModalOpen, setIsConfirmCancelModalOpen] = useState(false);
  const [isConvenioModalOpen, setIsConvenioModalOpen] = useState(false);


  // Estado para formulário de ativação de convênio
  const [novoConvenio, setNovoConvenio] = useState({
    agencia: '',
    contaCorrente: '',
    numeroConvenio: '',
    numeroCarteira: '',
    numeroVariacaoCarteira: ''
  });

  // Estado para confirmação de desativação
  const [showConfirmDesativarConvenio, setShowConfirmDesativarConvenio] = useState(false);

  // Atualiza campos do formulário de convênio
  const handleChangeConvenio = (e) => {
    const { name, value } = e.target;
    setNovoConvenio({ ...novoConvenio, [name]: value });
  };

  // Ativa o convênio (envia dados)
  const handleAtivarConvenio = async (dados) => {
    try {
      await addConvenio(dados);
      fetchConvenio();
      setIsConvenioModalOpen(false);
    } catch (error) {
      console.error("Erro ao ativar convênio:", error);
    }
  };

  // Desativa o convênio
  const handleDesativarConvenio = async () => {
    try {
      await deleteConvenio(convenio.id);
      fetchConvenio();
      setIsConvenioModalOpen(false);
      setShowConfirmDesativarConvenio(false);
      setNovoConvenio({
        agencia: '',
        contaCorrente: '',
        numeroConvenio: '',
        numeroCarteira: '',
        numeroVariacaoCarteira: ''
      });
    } catch (error) {
      console.error("Erro ao desativar convênio:", error);
    }
  };

  useEffect(() => {
    if (isConvenioModalOpen) {
      const loadConvenio = async () => {
        await fetchConvenio();
      };
      loadConvenio();
    } else {
      setNovoConvenio({
        agencia: '',
        contaCorrente: '',
        numeroConvenio: '',
        numeroCarteira: '',
        numeroVariacaoCarteira: ''
      });
    }
  }, [isConvenioModalOpen, fetchConvenio]);



  const toggleConciliacao = () => {
    setIsConciliacaoOpen(!isConciliacaoOpen);
  };
  const toggleConfiguracao = () => {
    setIsConfiguracaoOpen(!isConfiguracaoOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleConfirmCancelarAssinatura = async () => {
    try {
      await cancelarAssinatura();
      setIsConfirmCancelModalOpen(false);

      setTimeout(async () => {
        await logout();
      }, 2000);
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error);
    }
  };

  return (
    <>
      <button className="menu-icon" onClick={toggleSidebar}>
        {isSidebarOpen ? <ArrowLeftCircle /> : <ArrowRightCircle />}
      </button>
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo-container">
          <img src={logo} alt="iKont1 Logo" className="logo" />
        </div>
        <div className="menu-container">
          <nav>
            <ul>
              <li>
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <Grid className="icon" /> Dashboard
                </NavLink>
              </li>
              <li onClick={toggleConciliacao} className={isConciliacaoOpen ? "submenu-open" : ""}>
                <div style={{ paddingLeft: '20px' }} className="menu-item">
                  <BarChart2 className="icon" /> Conciliação
                </div>
                {isConciliacaoOpen && (
                  <ul className="submenu">
                    <li>
                      <NavLink to="/conciliacao-financeira" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Minimize2 className="icon" /> Conciliação financeira
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/contas-receber" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <ArrowDownLeft className="icon" /> Contas a receber
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/contas-pagar" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <ArrowUpRight className="icon" /> Contas a pagar
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/notas-fiscais" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <FileText className="icon" /> Notas fiscais
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/carteira" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <DollarSign className="icon" /> Carteira
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/clientes-fornecedores" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Users className="icon" /> Clientes e Fornecedores
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>
              {/* <li>
                <NavLink to="/rh" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <UserPlus className="icon" /> RH
                </NavLink>
              </li> */}
              <li className="divider"></li>

              <li>
                <NavLink style={{ fontWeight: 100 }} to="/minha-empresa" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <Briefcase style={{ color: 'var(--highlight-color)' }} className="icon" /> Minha Empresa
                </NavLink>
              </li>

              <li onClick={toggleConfiguracao} className={isConfiguracaoOpen ? "submenu-open" : ""}>
                <div style={{ paddingLeft: '20px' }} className="menu-item">
                  <Settings style={{ color: 'var(--highlight-color)' }} className="icon" /> Configurações
                </div>
                {isConfiguracaoOpen && (
                  <ul className="submenu">
                    <li>
                      <NavLink to="/certificado" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Award className="icon" /> Certificado Digital
                      </NavLink>
                    </li>

                    <Permissao ehAdmin>
                      <li>
                        <NavLink to="/perfis" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                          <Users className="icon" /> Perfis
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                          <User className="icon" /> Usuários
                        </NavLink>
                      </li>
                    </Permissao>

                    <li>
                      <button
                        className="nav-link button-link"
                        onClick={() => setIsConvenioModalOpen(true)}
                      >
                        <DollarSign className="icon" /> Cobrança BB
                      </button>
                    </li>
                    <li>
                      <button
                        className="nav-link button-link"
                        onClick={() => setIsConfirmCancelModalOpen(true)}
                      >
                        <BookOpen className="icon" /> Cancelar assinatura
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </nav>
        </div>
        <div className="bottom-links">
          <ul>
            <li>
              <a style={{ fontWeight: 100 }} href='https://api.whatsapp.com/send/?phone=5586994530553&text&type=phone_number&app_absent=0' target='_blanck'>
                <HelpCircle className="icon" /> Ajuda
              </a>
            </li>
            <li>
              <button className='logout-button' onClick={handleLogout}>
                <LogOut className="icon" /> Sair
              </button>
            </li>
          </ul>
        </div>
      </div>



      {isConvenioModalOpen && (
        <Modal
          isOpen={isConvenioModalOpen}
          onClose={() => setIsConvenioModalOpen(false)}
          title="Cobrança BB"
        >
          {convenio && convenio.id ? (
            <form>
              <p className='convAtivo'>Convênio ativo</p>
              <div className="form-group">
                <label htmlFor="agencia">Agência</label>
                <input
                  type="text"
                  name="agencia"
                  value={convenio.agencia}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="contaCorrente">Conta Corrente</label>
                <input
                  type="text"
                  name="contaCorrente"
                  value={convenio.contaCorrente}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="numeroConvenio">Número Convênio</label>
                <input
                  type="text"
                  name="numeroConvenio"
                  value={convenio.numeroConvenio}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="numeroCarteira">Número Carteira</label>
                <input
                  type="text"
                  name="numeroCarteira"
                  value={convenio.numeroCarteira}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="numeroVariacaoCarteira">Variação Carteira</label>
                <input
                  type="text"
                  name="numeroVariacaoCarteira"
                  value={convenio.numeroVariacaoCarteira}
                  readOnly
                />
              </div>
              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="cancel" onClick={() => setIsConvenioModalOpen(false)}>Fechar</button>
                <button
                  type="button"
                  className="save"
                  style={{ backgroundColor: 'red' }}
                  onClick={() => setShowConfirmDesativarConvenio(true)}
                >
                  Desativar
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAtivarConvenio(novoConvenio);
            }}
            >
              <p>Preencha os dados para ativar o convênio com BB:</p>
              <div className="form-group">
                <label htmlFor="agencia">Agência</label>
                <input
                  type="text"
                  name="agencia"
                  value={novoConvenio.agencia}
                  onChange={handleChangeConvenio}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contaCorrente">Conta Corrente</label>
                <input
                  type="text"
                  name="contaCorrente"
                  value={novoConvenio.contaCorrente}
                  onChange={handleChangeConvenio}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="numeroConvenio">Número Convênio</label>
                <input
                  type="text"
                  name="numeroConvenio"
                  value={novoConvenio.numeroConvenio}
                  onChange={handleChangeConvenio}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="numeroCarteira">Número Carteira</label>
                <input
                  type="text"
                  name="numeroCarteira"
                  value={novoConvenio.numeroCarteira}
                  onChange={handleChangeConvenio}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="numeroVariacaoCarteira">Variação Carteira</label>
                <input
                  type="text"
                  name="numeroVariacaoCarteira"
                  value={novoConvenio.numeroVariacaoCarteira}
                  onChange={handleChangeConvenio}
                  required
                />
              </div>
              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="cancel" onClick={() => setIsConvenioModalOpen(false)}>Cancelar</button>
                <button type="submit" className="save">Ativar</button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Modal de Confirmação */}
      {isConfirmCancelModalOpen && (
        <ConfirmationModal
          title="Confirmar Cancelamento"
          message="Tem certeza de que deseja cancelar sua assinatura?"
          secondaryMessage="Essa ação não pode ser desfeita e o acesso será perdido imediatamente."
          onConfirm={handleConfirmCancelarAssinatura}
          onCancel={() => setIsConfirmCancelModalOpen(false)}
        />
      )}
      {showConfirmDesativarConvenio && (
        <ConfirmationModal
          title="Confirmar Desativação"
          message="Tem certeza que deseja desativar o convênio BB?"
          onConfirm={handleDesativarConvenio}
          onCancel={() => setShowConfirmDesativarConvenio(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
