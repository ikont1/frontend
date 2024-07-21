import { BrowserRouter } from "react-router-dom";
import RoutesApp from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import { FinanceProvider } from "./context/FinanceContext";
import { ClientSupplierProvider } from "./context/ClientSupplierContext";


function App() {
  return (
    <BrowserRouter className="container">
      <AuthProvider>
        <AccountProvider>
          <ClientSupplierProvider>
            <FinanceProvider>
              <RoutesApp />
            </FinanceProvider>
          </ClientSupplierProvider>
        </AccountProvider>
      </AuthProvider>
    </BrowserRouter >
  );
}

export default App;
