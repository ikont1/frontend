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
    <BrowserRouter className="container"
      future={{
        // Ativando flags futuras do React Router v7:
        v7_relativeSplatPath: true, // - v7_relativeSplatPath: garante resolução correta de rotas relativas dentro de rotas com '*'
        v7_startTransition: true // - v7_startTransition: melhora a performance da navegação usando React.startTransition()
      }}>
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
