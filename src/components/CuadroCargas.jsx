/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import "./../styles/guias/CuadroCargas.css";
import { useEffect, useRef } from "react";
import { useEstados } from "../contexts/EstadosContext";

const CuadroCargas = ({ cargas, eliminarCarga }) => {
  const { rol, setCargaActual } = useEstados();
  const ruta = () => {
    if (rol === "Inspección de Vehículos") return "/cc1";
    if (rol === "Control Pesaje") return "/pesaje1";
    if (rol === "Control de Calidad") return "/cc3";
    if (rol === "Sistemas") return "/sist1";
    else return "/datosg1";
  };

  const cargaContainerRef = useRef(null);

  useEffect(() => {
    if (cargaContainerRef.current) {
      cargaContainerRef.current.scrollTop =
        cargaContainerRef.current.scrollHeight;
    }
  }, [cargas]);

  return (
    <div className="carga-container">
      <div className="carga-buttons-container" ref={cargaContainerRef}>
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
