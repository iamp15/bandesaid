/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import "./../styles/guias/CuadroCargas.css";

const CuadroCargas = ({ cargas, rol, setCargaActual, eliminarCarga }) => {
  const ruta = () => {
    if (rol === "Control Pesaje") return "";
    if (rol === "Control de Calidad") return "";
    else return "/datosg1";
  };

  return (
    <div className="carga-container">
      <div className="carga-buttons-container">
        <div className="carga-buttons">
          {cargas.map((carga, index) => (
            <div key={carga.id || index} className="carga-button-group">
              <Link to={ruta()}>
                <button onClick={() => setCargaActual(carga.id || index + 1)}>
                  Carga #{carga.id || index + 1}
                </button>
              </Link>
              <button
                className="eliminar-button"
                onClick={() => eliminarCarga(carga.id || index)}
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CuadroCargas;
