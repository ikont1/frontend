import { BrowserRouter } from "react-router-dom";
import RoutesApp from "./routes";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import { FinanceProvider } from "./context/FinanceContext";


function App() {
  return (
    <BrowserRouter className="container">
      <AuthProvider>
        <AccountProvider>
          <DataProvider>
            <FinanceProvider>
              <RoutesApp />
            </FinanceProvider>
          </DataProvider>
        </AccountProvider>
      </AuthProvider>
    </BrowserRouter >
  );
}

export default App;
