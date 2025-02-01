/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PROVIDER_MAP } from "../../constants";
import { useGuardar } from "../../hooks/useGuardar";

const ControlPesaje = ({
  cargas,
  setCargas,
  proveedor,
  cargaActual,
  setCargaActual,
}) => {
  const key = PROVIDER_MAP[proveedor];
  const currentCarga = cargas[key]?.[cargaActual - 1] || {};
  const guardar = useGuardar(setCargas);
  const [thermoKingStatus, setThermoKingStatus] = useState(
    currentCarga?.tk || "Si"
  );

  const handleThermoKingChange = (event) => {
    const newStatus = event.target.value;
    setThermoKingStatus(newStatus);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newData = {
      tk: thermoKingStatus,
      id_unidad: event.target["id-unidad"].value,
    };
    guardar(proveedor, cargaActual, "/pesaje2", newData);
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          <h2>Control de pesaje</h2>
          <label htmlFor="tk">Therno King: </label>
          <select
            name="tk"
            id="tk"
            value={thermoKingStatus}
            onChange={handleThermoKingChange}
          >
            <option value="Si">Sí</option>
            <option value="No">No</option>
          </select>

          <label htmlFor="id-unidad">ID Unidad: </label>
          <input
            type="number"
            id="id-unidad"
            name="id-unidad"
            defaultValue={currentCarga.id_unidad}
            placeholder="Ingresa el ID de la unidad en el sistema"
          />

          {/****** Botones ******/}
          <div className="button-group">
            <Link to={"/carga"}>
              <button onClick={() => setCargaActual(0)}>Atras</button>
            </Link>
            <button type="submit">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ControlPesaje;
