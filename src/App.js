import { BrowserRouter } from "react-router-dom";
import RoutesApp from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import { FinanceProvider } from "./context/FinanceContext";
import { ClientSupplierProvider } from "./context/ClientSupplierContext";
import { WalletProvider } from "./context/WalletContext";
import { ConciliacaoProvider } from "./context/ConciliacaoContext";

function App() {
  return (
    <BrowserRouter className="container">
      <AuthProvider>
        <AccountProvider>
          <ClientSupplierProvider>
            <FinanceProvider>
              <WalletProvider>
                <ConciliacaoProvider>

                  <RoutesApp />

                </ConciliacaoProvider>
              </WalletProvider>
            </FinanceProvider>
          </ClientSupplierProvider>
        </AccountProvider>
      </AuthProvider>
    </BrowserRouter >
  );
}

export default App;
