import "../styles/LoadingSpinner.css";
import { useNavigate } from "react-router-dom";

const LoadingSpinner = () => {
  const navigate = useNavigate();
  return (
    <div className="wrap-container">
      <div className="menu">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p className="loading-text">Cargando...</p>
        </div>
        <div className="button-group">
          <button type="button" onClick={() => navigate("/menu")}>
            Ir a inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
