/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { PROVIDER_MAP } from "../../constants/constants";
import { RUBRO } from "../../constants/constants";
import { useState, useEffect } from "react";
import "../../styles/guias/revisionGuias.css";

const RevisionGuias = ({ cargas, proveedor, cargaActual }) => {
  const mapeo = PROVIDER_MAP[proveedor];
  const infoCarga = cargas[mapeo]?.[cargaActual - 1];
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have all required data
    if (infoCarga?.codigos_guias && infoCarga?.precintos) {
      setIsLoading(false);
    }
  }, [infoCarga]);

  if (isLoading) {
    return (
      <div className="wrap-container">
        <div>Cargando información...</div>
      </div>
    );
  }

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Verificación de Datos</h2>
        <div className="section">
          <h3>Chofer y Vehículo</h3>
          <p>Nombre: {infoCarga.chofer} </p>
          <p>Cédula: {infoCarga.cedula} </p>
          <p>Marca vehículo: {infoCarga.marcaVehiculo} </p>
          <p>Placa: {infoCarga.placa} </p>
          <button onClick={() => navigate("/datosg1")}>Editar</button>
        </div>

        <div className="section">
          <h3>Comercializadora</h3>
          <p>Entidad destino: {infoCarga.destino} </p>
          <p>Código espejo: {infoCarga.codigo_espejo} </p>
          <p>Estado destino: {infoCarga.estadoDestino} </p>
          <p>Transporte: {infoCarga.transporte}</p>
          <button onClick={() => navigate("/datosg2")}>Editar</button>
        </div>

        <div className="section">
          <h3>Control de Calidad y Pesaje</h3>
          <p>Rubro: {RUBRO}</p>
          <p>Marca: {infoCarga.marca_rubro}</p>
          <p>Peso promedio: {infoCarga.p_promedio} kg</p>
          <p>Temperatura promedio: {infoCarga.t_promedio} ºC</p>
          <p>Peso según guía: {infoCarga.p_guia} kg</p>
          <p>Peso verificado: {infoCarga.p_verificado} kg</p>
          <button onClick={() => navigate("/datosg3")}>Editar</button>
        </div>

        <div className="section">
          <h3>Datos Guía</h3>
          {infoCarga.codigos_guias.length > 1 ? (
            <div>
              {infoCarga.codigos_guias.map((codigo, index) => (
                <p key={index}>
                  Guía {index + 1} - {codigo} - {infoCarga.pesos_guias[index]}{" "}
                  kg
                </p>
              ))}
            </div>
          ) : (
            <p>Código guía: {infoCarga.codigos_guias[0]}</p>
          )}
          <p>Precintos: {infoCarga.precintos.join(", ")} </p>
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
