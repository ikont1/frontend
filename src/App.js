import { BrowserRouter } from "react-router-dom";
import RoutesApp from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import { FinanceProvider } from "./context/FinanceContext";
import { ClientSupplierProvider } from "./context/ClientSupplierContext";
import { WalletProvider } from "./context/WalletContext";

function App() {
  return (
    <BrowserRouter className="container">
      <AuthProvider>
        <AccountProvider>
          <ClientSupplierProvider>
            <FinanceProvider>
              <WalletProvider>
                <RoutesApp />
              </WalletProvider>
            </FinanceProvider>
          </ClientSupplierProvider>
        </AccountProvider>
      </AuthProvider>
    </BrowserRouter >
  );
}

export default App;
