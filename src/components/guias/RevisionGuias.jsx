import { useNavigate } from "react-router-dom";
/* eslint-disable react/prop-types */
import { PROVIDER_MAP } from "../../constants";

const RevisionGuias = ({ cargas, proveedor, cargaActual }) => {
  const mapeo = PROVIDER_MAP[proveedor];
  const infoCarga = cargas[mapeo]?.[cargaActual - 1];
  const navigate = useNavigate();

  return (
    <div>
      <h2>Verificación de Datos</h2>
      <h3>Chofer y Vehículo</h3>
      <p>Nombre: {infoCarga.nombre} </p>
      <p>Cédula: {infoCarga.cedula} </p>
      <p>Marca: {infoCarga.marca} </p>
      <p>Placa: {infoCarga.placa} </p>
      <button onClick={() => navigate("/datosg1")}>Editar</button>

      <h3>Distribuidora</h3>
      <p>Nombre: {infoCarga.empresa} </p>
      <p>Destino: {infoCarga.destino} </p>
      <button onClick={() => navigate("/datosg2")}>Editar</button>

      <h3>Control de Calidad y Pesaje</h3>
      <p>Peso promedio: {infoCarga.p_promedio}</p>
      <p>Temperatura promedio: {infoCarga.t_promedio}</p>
      <p>Peso según guía: {infoCarga.p_guia}</p>
      <p>Peso verificado: {infoCarga.p_verificado}</p>
      <button onClick={() => navigate("/datosg3")}>Editar</button>

      <h3>Datos Guía</h3>
      <p>Guías: {infoCarga.codigos_guias.join(", ")}</p>
      <p>Precintos: {infoCarga.precintos.join(", ")} </p>
      <button onClick={() => navigate("/datosg4")}>Editar</button>
      <br />
      <br />
      <button onClick={() => navigate("/formulariosguia")}>Confirmar</button>
    </div>
  );
};

export default RevisionGuias;
