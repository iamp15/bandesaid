/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEstados } from "../../contexts/EstadosContext";
import { useAlert } from "../alert/AlertContext";
import "../../styles/guias/GuiaTabs.css";

const TABS = [
  { path: "/datosg1", icon: "🚚", label: "Chofer" },
  { path: "/datosg2", icon: "🏢", label: "Destino" },
  { path: "/datosg3", icon: "⚖️", label: "Control" },
  { path: "/datosg4", icon: "🧾", label: "Guías" },
  { path: "/revisionguias", icon: "📋", label: "Revisión" },
];

const GuiaTabsContext = createContext(null);

export const useGuiaTabs = () => useContext(GuiaTabsContext);

const GuiaTabsLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCargaActual } = useEstados();
  const { addAlert } = useAlert();
  const [isEditing, setIsEditing] = useState(false);

  const goBack = () => {
    setCargaActual(0);
    navigate("/carga");
  };

  const handleTabClick = (path) => {
    if (location.pathname === path) return;
    if (isEditing) {
      addAlert("Por favor, guarda los cambios antes de continuar", "error");
      return;
    }
    navigate(path);
  };

  return (
    <GuiaTabsContext.Provider value={{ isEditing, setIsEditing }}>
      <div className="guias-tabs">
        <div className="guias-tabs-header">
          <button type="button" className="guias-back-btn" onClick={goBack}>
            <span className="guias-back-arrow" aria-hidden="true">
              ←
            </span>
            Atras
          </button>
          <nav className="guias-tabs-bar" aria-label="Secciones de la guía">
            {TABS.map((tab) => (
              <button
                key={tab.path}
                type="button"
                className={`guias-tab ${
                  location.pathname === tab.path ? "active" : ""
                }`}
                onClick={() => handleTabClick(tab.path)}
              >
                <span className="guias-tab-icon" aria-hidden="true">
                  {tab.icon}
                </span>
                <span className="guias-tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="guias-tabs-content">{children}</div>
      </div>
    </GuiaTabsContext.Provider>
  );
};

export default GuiaTabsLayout;
