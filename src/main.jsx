import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { HashRouter as Router } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { AlertProvider } from "./components/alert/AlertContext.jsx";
import { AuthProvider } from "./components/login/AuthContext.jsx";
import { LogProvider } from "./contexts/LogContext.jsx";
import { EstadosProvider } from "./contexts/EstadosContext.jsx";

createRoot(document.getElementById("root")).render(
  <Router>
    <EstadosProvider>
      <LogProvider>
        <AlertProvider>
          <AuthProvider>
            <ScrollToTop />
            <App />
          </AuthProvider>
        </AlertProvider>
      </LogProvider>
    </EstadosProvider>
  </Router>
);
