/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { PROVIDER_MAP } from "../../constants/constants";
import { RUBRO } from "../../constants/constants";
import { useState, useEffect } from "react";
import "../../styles/guias/revisionGuias.css";
import LoadingSpinner from "../LoadingSpinner";
import { useEstados } from "../../contexts/EstadosContext";

const RevisionGuias = () => {
  const { cargas, cargaActual, proveedor } = useEstados();
  const mapeo = PROVIDER_MAP[proveedor];
  const infoCarga = cargas ? cargas[mapeo]?.[cargaActual - 1] : [];
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have all required data
    if (infoCarga?.codigos_guias && infoCarga?.precintos) {
      setIsLoading(false);
    }
  }, [infoCarga]);

  if (isLoading || !infoCarga) {
    return (
      <div className="wrap-container">
        <div className="menu">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Verificación de Datos</h2>
        <div className="section">
          <h3>Chofer y Vehículo</h3>
          <p>
            Nombre: <span className="value">{infoCarga.chofer}</span>{" "}
          </p>
          <p>
            Cédula: <span className="value">{infoCarga.cedula}</span>{" "}
          </p>
          <p>
            Marca vehículo:{" "}
            <span className="value">{infoCarga.marcaVehiculo}</span>{" "}
          </p>
          <p>
            Placa: <span className="value">{infoCarga.placa}</span>{" "}
          </p>
          <button onClick={() => navigate("/datosg1")}>Editar</button>
        </div>

        <div className="section">
          <h3>Comercializadora</h3>
          <p>
            Entidad destino: <span className="value">{infoCarga.destino}</span>
          </p>
          <p>
            Código espejo:{" "}
            <span className="value">{infoCarga.codigo_espejo}</span>
          </p>
          <p>
            Estado destino:{" "}
            <span className="value">{infoCarga.estadoDestino}</span>
          </p>
          <p>
            Transporte: <span className="value">{infoCarga.transporte}</span>
          </p>
          <button onClick={() => navigate("/datosg2")}>Editar</button>
        </div>

        <div className="section">
          <h3>Control de Calidad y Pesaje</h3>
          <p>
            Rubro: <span className="value">{RUBRO}</span>
          </p>
          <p>
            Marca: <span className="value">{infoCarga.marca_rubro}</span>
          </p>
          <p>
            Lote: <span className="value">{infoCarga.lote}</span>
          </p>
          <p>
            Peso promedio:{" "}
            <span className="value">{infoCarga.p_promedio} kg</span>
          </p>
          <p>
            Temperatura promedio:{" "}
            <span className="value">{infoCarga.t_promedio} ºC</span>
          </p>
          <p>
            Peso total de la carga:{" "}
            <span className="value">{infoCarga.p_total} kg</span>
          </p>
          <p>
            Peso verificado:{" "}
            <span className="value">{infoCarga.p_verificado} kg</span>
          </p>
          <button onClick={() => navigate("/datosg3")}>Editar</button>
        </div>

        <div className="section">
          <h3>Datos Guía</h3>
          {infoCarga.codigos_guias.length > 1 ? (
            <div>
              {infoCarga.codigos_guias.map((codigo, index) => (
                <p key={index}>
                  Guía {index + 1} -{" "}
                  <span className="value">
                    {codigo} - {infoCarga.pesos_guias[index]} kg
                  </span>
                </p>
              ))}
            </div>
          ) : (
            <p>
              Código guía:{" "}
              <span className="value">{infoCarga.codigos_guias[0]}</span>
            </p>
          )}
          <p>
            Precintos:{" "}
            <span className="value">{infoCarga.precintos.join(", ")}</span>
          </p>
          <p>
            ID del despacho:{" "}
            <span className="value">{infoCarga.id_despacho}</span>
          </p>
          <button onClick={() => navigate("/datosg4")}>Editar</button>
        </div>

        <div className="button-group">
          <button onClick={() => navigate("/formulariosguia")}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevisionGuias;
