import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard/Dashboard";
import Carteira from "../pages/Carteira/Carteira";
import ConciliacaoFinan from "../pages/Conciliacao/ConciliacaoFinan";

function RoutesApp() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/carteira" element={<Carteira />} />
      <Route path="/conciliacao-financeira" element={<ConciliacaoFinan />} />
      {/* Defina as rotas adicionais aqui */}
    </Routes>
  );
}

export default RoutesApp;