/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { PROVIDER_MAP } from "../../constants";
import { RUBRO } from "../../constants";
import "../../styles/guias/revisionGuias.css";

const RevisionGuias = ({ cargas, proveedor, cargaActual }) => {
  const mapeo = PROVIDER_MAP[proveedor];
  const infoCarga = cargas[mapeo]?.[cargaActual - 1];
  const navigate = useNavigate();

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
          <p>Guías: {infoCarga.codigos_guias.join(", ")}</p>
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
