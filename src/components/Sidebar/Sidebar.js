import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, DollarSign, Users, Briefcase, Settings, HelpCircle, LogOut, Minimize2, Grid, BarChart2, UserPlus, ArrowDownLeft, ArrowUpRight } from 'react-feather';
import './Sidebar.css';
import logo from '../../assets/imgs/logosvg.svg';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth(); // Obtendo a função de logout do contexto
  const [isConciliacaoOpen, setIsConciliacaoOpen] = useState(false);

  const toggleConciliacao = () => {
    setIsConciliacaoOpen(!isConciliacaoOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="sidebar">
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
              <div className="menu-item">
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
            <li>
              <NavLink to="/rh" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <UserPlus className="icon" /> RH
              </NavLink>
            </li>
            <li className="divider"></li>
            <li>
              <NavLink style={{ fontWeight: 100 }} to="/minha-empresa" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <Briefcase style={{ color: 'var(--highlight-color)' }} className="icon" /> Minha Empresa
              </NavLink>
            </li>
            <li>
              <NavLink style={{ fontWeight: 100 }} to="/configuracoes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <Settings style={{ color: 'var(--highlight-color)' }} className="icon" /> Configurações
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="bottom-links">
        <ul>
          <li>
            <NavLink style={{ fontWeight: 100 }} to="/ajuda" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <HelpCircle className="icon" /> Ajuda
            </NavLink>
          </li>
          <li>
            <button className='logout-button' onClick={handleLogout}>
              <LogOut className="icon" /> Sair
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
