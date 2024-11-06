import React from 'react';
import Sidebar from './SidebarBackOffice';
import Header from './HeaderBackOffice';
import './Backoffice.css';
import { BiWallet, BiPen, BiUser } from 'react-icons/bi';



const VisaoGeral = () => {

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className='container-dashboard'>
          <div className='sections-cards-dash'>
            <div className='cards-right' style={{ width: '100%' }}>
              <div className='card-areceber'>
                <h4><BiUser className='icon' />Clientes </h4>
                <div className='conteudo'>
                  <p>Nada para mostrar</p>

                </div>
              </div>

              <div className='card-areceber'>
                <h4><BiPen className='icon' />Assinaturas </h4>
                <div className='conteudo'>
                  <p>Nada para mostrar</p>

                </div>
              </div>

              <div className='card-apagar'>
                <h4><BiWallet className='icon' />Receitas </h4>
                <div className='conteudo'>
                  <p>Nada para mostrar</p>

                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaoGeral;
