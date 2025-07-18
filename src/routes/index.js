import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login.js";
import Dashboard from "../pages/Dashboard/Dashboard";
import Carteira from "../pages/Carteira/Carteira";
import ContasReceber from "../pages/ContasPagarReceber/ContasReceber.js";
import ContasAPagar from "../pages/ContasPagarReceber/ContasAPagar.js";
import ClientesFornecedores from "../pages/ClientesFornecedores/ClientesFornecedores.js";
import MinhaEmpresa from "../pages/Conta/MinhaEmpresa.js";
import NotasFiscais from "../pages/NotasFiscais/NotasFiscais.js";
import ProtectedRoute from "./ProtectedRoute.js";
import RecuperarSenha from "../pages/Login/recuperarSenha.js";
import RedefinirSenha from "../pages/Login/redefinirSenha.js";
import DetalhesConta from "../pages/Carteira/DetalhesConta.js";
import CadastroContaBancaria from '../pages/Carteira/CadastroContaBancaria.js';
import Conciliacao from "../pages/Conciliacao/Conciliacao.js";
import Assinatura from "../pages/Assinatura/Assinatura.js";
import Certificado from "../pages/Certificado/Certificado.js";
import Usuarios from "../pages/Usuarios/Usuarios.js";
import Perfis from "../pages/Usuarios/Perfis.js";


function RoutesApp() {
  return (
    <Routes>
      {/* Rotas livres */}
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/nova-senha" element={<RedefinirSenha />} />
      <Route path="/assinatura" element={<Assinatura />} />

      {/* Rotas bloqueadas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/notas-fiscais" element={<NotasFiscais />} />
        <Route path="/carteira" element={<Carteira />} />
        <Route path="/contas-receber" element={<ContasReceber />} />
        <Route path="/contas-pagar" element={<ContasAPagar />} />
        <Route path="/clientes-fornecedores" element={<ClientesFornecedores />} />
        <Route path="/minha-empresa" element={<MinhaEmpresa />} />
        <Route path="/conta/:id" element={<DetalhesConta />} />
        <Route path="/cadastro-conta-bancaria" element={<CadastroContaBancaria />} />
        <Route path="/conciliacao-financeira" element={<Conciliacao />} />
        <Route path="/certificado" element={<Certificado />} />

        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/perfis" element={<Perfis />} />


      </Route>
    </Routes >
  );
}

export default RoutesApp;
