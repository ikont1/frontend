import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {Settings, HelpCircle, LogOut, Eye, Grid, BarChart2, ArrowLeftCircle, ArrowRightCircle, Award, Lock, PlusCircle } from 'react-feather';
import logo from '../../assets/imgs/logosvg.svg';
import { useAuth } from '../../context/AuthContext';

const SidebarBackOffice = () => {
  const { logout } = useAuth();
  const [isUsuarioOpen, setIsUsuarioOpen] = useState(false);
  const [isConfiguracaoOpen, setIsConfiguracaoOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleConciliacao = () => {
    setIsUsuarioOpen(!isUsuarioOpen);
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
                <NavLink to="/backoffice" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <Grid className="icon" /> Visão geral
                </NavLink>
              </li>

              <li onClick={toggleConciliacao} className={isUsuarioOpen ? "submenu-open" : ""}>
                <div style={{paddingLeft: '20px'}} className="menu-item">
                  <BarChart2 className="icon" /> Usuário
                </div>
                {isUsuarioOpen && (
                  <ul className="submenu">
                    <li>
                      <NavLink to="/backoffice" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Eye className="icon" /> Vusualizar
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/backoffice" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <PlusCircle className="icon" /> Cadastrar
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              <li className="divider"></li>

              <li onClick={toggleConfiguracao} className={isConfiguracaoOpen ? "submenu-open" : ""}>
                <div style={{paddingLeft: '20px'}} className="menu-item">
                  <Settings style={{ color: 'var(--highlight-color)' }} className="icon" /> Configurações
                </div>
                {isConfiguracaoOpen && (
                  <ul className="submenu">
                    <li>
                      <NavLink to="/backoffice" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Lock className="icon" /> Permisões 
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/backoffice" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Award className="icon" /> Assinaturas
                      </NavLink>
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
    </>
  );
};

export default SidebarBackOffice;
