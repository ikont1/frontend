import { BrowserRouter } from "react-router-dom";
import RoutesApp from "./routes";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter className="container">
      <AuthProvider>
        <DataProvider>
          <RoutesApp />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter >
  );
}

export default App;
