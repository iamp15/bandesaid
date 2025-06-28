/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import "./../styles/Rol.css";
import { useEstados } from "../contexts/EstadosContext";
import { useNavigate } from "react-router-dom";

export const Rol = () => {
  const { setRol } = useEstados();
  const navigate = useNavigate();

  const handleVolver = () => {
    setRol("");
    localStorage.removeItem("rol");
    navigate("/menu");
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Escoge tu rol:</h2>
        <div className="buttons-container">
          <Link to={"/proveedor"}>
            <button onClick={() => setRol("Inspección de Vehículos")}>
              Inspección de Vehículos
            </button>
            <button onClick={() => setRol("Control Pesaje")}>
              Control de Pesaje
            </button>
            <button onClick={() => setRol("Control de Calidad")}>
              Control de Calidad
            </button>
            <button onClick={() => setRol("Verificación de Guías")}>
              Verificación de Guías
            </button>
            <button onClick={() => setRol("Sistemas")}>Sistemas</button>
          </Link>
        </div>
        <div className="button-group">
          <button onClick={handleVolver}>Volver a inicio</button>
        </div>
      </div>
    </div>
  );
};
