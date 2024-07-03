import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login.js";
import Dashboard from "../pages/Dashboard/Dashboard";
import Carteira from "../pages/Carteira/Carteira";
import ContasReceber from "../pages/ContasPagarReceber/ContasReceber.js";
import ContasAPagar from "../pages/ContasPagarReceber/ContasAPagar.js";
import ClientesFornecedores from "../pages/ClientesFornecedores/ClientesFornecedores.js";
import MinhaEmpresa from "../pages/MinhaEmpresa/MinhaEmpresa.js";
import NotasFiscais from "../pages/NotasFiscais/NotasFiscais.js";
import ProtectedRoute from "./ProtectedRoute.js";
import RecuperarSenha from "../pages/Login/recuperarSenha.js";
import RedefinirSenha from "../pages/Login/redefinirSenha.js";
import CadastroUsuario from "../pages/Usuario/CadastroUsuario.js";


function RoutesApp() {
  return (
    <Routes>
      {/* Rotas livres */}
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha/>} />
      <Route path="/nova-senha" element={<RedefinirSenha/>} />
      <Route path="/cadastro-usuario" element={<CadastroUsuario/>} />

      {/* Rotas bloqueadas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/notas-fiscais" element={<NotasFiscais />} />
        <Route path="/carteira" element={<Carteira />} />
        <Route path="/contas-receber" element={<ContasReceber />} />
        <Route path="/contas-pagar" element={<ContasAPagar />} />
        <Route path="/clientes-fornecedores" element={<ClientesFornecedores />} />
        <Route path="/minha-empresa" element={<MinhaEmpresa />} />
      </Route>
    </Routes >
  );
}

export default RoutesApp;
