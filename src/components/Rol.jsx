/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import "./../styles/Rol.css";

export const Rol = ({ setRol }) => {
  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Escoge tu rol:</h2>
        <div className="buttons-container">
          <Link to={"/proveedor"}>
            <button onClick={() => setRol("Control Pesaje")}>
              Control de Pesaje
            </button>
            <button onClick={() => setRol("Control de Calidad")}>
              Control de Calidad
            </button>
            <button onClick={() => setRol("Verificación de Guías")}>
              Verificación de Guías
            </button>
          </Link>
        </div>
        <div className="button-group">
          <Link to={"/"}>
            <button>Volver a inicio</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
