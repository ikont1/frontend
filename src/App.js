import { BrowserRouter } from "react-router-dom";
import RoutesApp from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import { FinanceProvider } from "./context/FinanceContext";
import { ClientSupplierProvider } from "./context/ClientSupplierContext";
import { WalletProvider } from "./context/WalletContext";
import { ConciliacaoProvider } from "./context/ConciliacaoContext";
import { AssinaturaProvider } from "./context/AssinaturaContext";
import { UsersProvider } from "./context/UsersContext";
import { NfProvider } from "./context/nfContext";

function App() {
  return (
    <BrowserRouter className="container">
      <AuthProvider>
        <UsersProvider>
          <AccountProvider>
            <ClientSupplierProvider>
              <FinanceProvider>
                <WalletProvider>
                  <ConciliacaoProvider>
                    <NfProvider>
                      <AssinaturaProvider>

                        <RoutesApp />

                      </AssinaturaProvider>
                    </NfProvider>
                  </ConciliacaoProvider>
                </WalletProvider>
              </FinanceProvider>
            </ClientSupplierProvider>
          </AccountProvider>
        </UsersProvider>
      </AuthProvider>
    </BrowserRouter >
  );
}

export default App;
