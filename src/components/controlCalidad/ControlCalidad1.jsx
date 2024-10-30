/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useState } from "react";
import { PROVIDER_MAP } from "../../constants";
import { useGuardar } from "../../hooks/useGuardar";
import { capitalizeWords } from "../../utils/Capitalizer";

const ControlCalidad1 = ({ cargas, setCargas, proveedor, cargaActual }) => {
  const key = PROVIDER_MAP[proveedor];
  const currentCarga = cargas[key]?.[cargaActual - 1] || {};
  const guardar = useGuardar(setCargas);
  const [thermoKingStatus, setThermoKingStatus] = useState(
    currentCarga?.tk || "Si"
  );
  const [paletas, setPaletas] = useState(currentCarga?.paletas || "No");
  const [smell, setSmell] = useState(currentCarga?.olor || "fresco");
  const [otherSmell, setOtherSmell] = useState(currentCarga?.otroOlor || "");
  const [paredes, setParedes] = useState(currentCarga?.paredes || "1");
  const [entidad, setEntidad] = useState(currentCarga?.entidad || "");
  const [responsable, setResponsable] = useState(
    currentCarga?.responsable || ""
  );
  const [destino, setDestino] = useState(currentCarga?.destino || "");

  const handleThermoKingChange = (event) => {
    const newStatus = event.target.value;
    setThermoKingStatus(newStatus);
  };

  const handlePalestasChange = (event) => {
    setPaletas(event.target.value);
  };

  const handleSmellChange = (event) => {
    setSmell(event.target.value);
    console.log(event.target.value);
  };

  const handleOtherSmellChange = (event) => {
    setOtherSmell(event.target.value);
  };

  const handleParedesChange = (event) => {
    setParedes(event.target.value);
    console.log(event.target.value);
  };

  const handleEntidadChange = (event) => {
    setEntidad(event.target.value);
  };

  const handleResponsableChange = (event) => {
    setResponsable(event.target.value);
  };

  const handleDestinoChange = (event) => {
    setDestino(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newData = {
      tk: thermoKingStatus,
      paletas: paletas,
      olor: smell,
      otroOlor: otherSmell,
      paredes: paredes,
      entidad: capitalizeWords(entidad),
      responsable: capitalizeWords(responsable),
      destino: capitalizeWords(destino),
    };
    console.log(newData);
    guardar(proveedor, cargaActual, "/cc2", newData);
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          <h2>Inspección de vehículo</h2>
          {/* Thermo King */}
          <label htmlFor="tk">Therno King: </label>
          <select
            name="tk"
            id="tk"
            value={thermoKingStatus}
            onChange={handleThermoKingChange}
          >
            <option value="Si">Sí</option>
            <option value="No">No</option>
            <option value="No posee">No posee</option>
          </select>

          {/* Paletas */}
          <label htmlFor="paletas">Paletas: </label>
          <select
            name="paletas"
            id="paletas"
            value={paletas}
            onChange={handlePalestasChange}
          >
            <option value="Si">Sí</option>
            <option value="No">No</option>
          </select>

          {/* Olor */}
          <label htmlFor="smell">Olor: </label>
          <select
            name="smell"
            id="smell"
            value={smell}
            onChange={handleSmellChange}
          >
            <option value="fresco">Fresco característico</option>
            <option value="otro">Otro</option>
          </select>

          {smell === "otro" && (
            <div>
              <label htmlFor="otherSmell">Especifique el olor: </label>
              <input
                type="text"
                id="otherSmell"
                name="otherSmell"
                value={otherSmell}
                onChange={handleOtherSmellChange}
              />
            </div>
          )}

          {/* Paredes y Techo */}
          <label htmlFor="paredes">Paredes y techo: </label>
          <select
            name="paredes"
            id="paredes"
            value={paredes}
            onChange={handleParedesChange}
          >
            <option value="1">Limpias y en buen estado</option>
            <option value="2">En mal estado pero limpias</option>
            <option value="3">Manchadas pero limpias</option>
            <option value="4">Manchadas y en mal estado</option>
            <option value="5">No tiene paredes ni techo</option>
          </select>

          {/* Entidad */}
          <label htmlFor="entidad">Entidad: </label>
          <input
            type="text"
            id="entidad"
            name="entidad"
            value={entidad}
            onChange={handleEntidadChange}
          />

          {/* Responsable */}
          <label htmlFor="responsable">Responsable: </label>
          <input
            type="text"
            id="responsable"
            name="responsable"
            value={responsable}
            onChange={handleResponsableChange}
          />

          {/* Destino */}
          <label htmlFor="destino">Destino: </label>
          <input
            type="text"
            id="destino"
            name="destino"
            value={destino}
            onChange={handleDestinoChange}
          />

          {/* Botones */}
          <div className="button-group">
            <Link to="/carga">
              <button type="button">Volver</button>
            </Link>
            <button type="submit">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ControlCalidad1;
