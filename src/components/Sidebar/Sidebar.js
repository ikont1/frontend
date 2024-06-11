import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, DollarSign, Users, Briefcase, Settings, HelpCircle, LogOut, Minimize2, Grid, BarChart2, UserPlus } from 'react-feather';
import './Sidebar.css';
import logo from '../../assets/imgs/Logo.png';

const Sidebar = () => {
  const [isConciliacaoOpen, setIsConciliacaoOpen] = useState(false);

  const toggleConciliacao = () => {
    setIsConciliacaoOpen(!isConciliacaoOpen);
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
              <NavLink exact to="/" activeClassName="active">
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
                    <NavLink to="/conciliacao-financeira" activeClassName="active">
                      <Minimize2 lassName="icon" /> Conciliação financeira
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/contas-receber" activeClassName="active">
                      <DollarSign className="icon" /> Contas a receber
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/contas-pagar" activeClassName="active">
                      <DollarSign className="icon" />Contas a pagar
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/notas-fiscais" activeClassName="active">
                      <FileText className="icon" />Notas fiscais
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/carteira" activeClassName="active">
                      <DollarSign className="icon" /> Carteira
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/clientes-fornecedores" activeClassName="active">
                      <Users className="icon" />Clientes e Fornecedores
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <NavLink to="/rh" activeClassName="active">
                <UserPlus className="icon" /> RH
              </NavLink>
            </li>
            <li className="divider"></li>
            <li>
              <NavLink style={{fontWeight: 100}} to="/minha-empresa" activeClassName="active">
                <Briefcase style={{ color: 'var(--highlight-color)' }} className="icon" /> Minha Empresa
              </NavLink>
            </li>
            <li>
              <NavLink style={{fontWeight: 100}} to="/configuracoes" activeClassName="active">
                <Settings style={{ color: 'var(--highlight-color)' }} className="icon" /> Configurações
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="bottom-links">
        <ul>
          <li>
            <NavLink style={{fontWeight: 100}} to="/ajuda" activeClassName="active">
              <HelpCircle className="icon" /> Ajuda
            </NavLink>
          </li>
          <li>
            <NavLink style={{fontWeight: 100}} to="/sair" activeClassName="active">
              <LogOut className="icon" /> Sair
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;