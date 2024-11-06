import React from 'react';
import { BarChart2} from 'react-feather';
import { useAccount } from '../../context/AccountContext';

const HeaderBackOffice = () => {
  const { dadosEmpresa } = useAccount(); // Acessa os dados da empresa do contexto

  return (
    <header className="header">
      <div className="left">
        <button>
          <BarChart2 /> Back Office
        </button>
      </div>

      <div className="right">
        <h5>{dadosEmpresa?.data.conta.nomeFantasia || 'Empresa não encontrada'}</h5>
      </div>
    </header>
  );
};

export default HeaderBackOffice;
