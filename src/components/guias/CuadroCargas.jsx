/* eslint-disable react/prop-types */

import { Link } from "react-router-dom";

const CuadroCargas = ({ numCarga, proveedor, rol, setCargaActual }) => {
  const ruta = () => {
    if (rol === "Control Pesaje") return "/cp";
    if (rol === "Control de Calidad") return "/cc";
    else return "/datosg1";
  };

  return (
    <div>
      <h3>Cargas creadas de {proveedor}:</h3>
      {[...Array(numCarga)].map((_, index) => (
        <div key={index}>
          <Link to={ruta()}>
            <button onClick={() => setCargaActual(index + 1)}>
              Carga #{index + 1}
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default CuadroCargas;
