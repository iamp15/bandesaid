/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useState } from "react";
import { PROVIDER_MAP } from "../../constants/constants";
import { useGuardar } from "../../hooks/useGuardar";
import { capitalizeWords } from "../../utils/Capitalizer";
import { useAuth } from "../login/AuthContext";
import EditableField from "../EditableField";
import { useAlert } from "../alert/AlertContext";
import { useNavigate } from "react-router-dom";
import { checkOnlineStatus } from "../../utils/OnlineStatus";
import "../../styles/controlCalidad/ControlCalidad1.css";
import { useEstados } from "../../contexts/EstadosContext";

const ControlCalidad1 = () => {
  const { cargas, setCargas, cargaActual, proveedor } = useEstados();
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
  const [puertaLateral, setPuertaLateral] = useState(
    currentCarga?.puertaLateral || "No"
  );
  const { currentUser } = useAuth();
  const [onEdit, setOnEdit] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { addAlert } = useAlert();
  const navigate = useNavigate();

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  const saveData = (fieldName, newValue) => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }

    const newData = {
      [fieldName]: newValue,
      editHistory: {
        ...currentCarga?.editHistory,
        [fieldName]: {
          value: newValue,
          editedBy: currentUser.name,
          editedAt: new Date().toISOString(),
        },
      },
    };
    guardar(proveedor, cargaActual, "", newData);
  };

  const formatEditHistory = (editHistory, fieldName) => {
    if (!editHistory?.[fieldName]) return null;

    return (
      <p className="autor">
        Editado por: {editHistory[fieldName].editedBy}
        {" a las "}
        {new Date(editHistory[fieldName].editedAt).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true, // This ensures 24-hour format
        })}
      </p>
    );
  };

  const handleThermoKingChange = (event) => {
    const newStatus = event.target.value;
    setThermoKingStatus(newStatus);
    saveData("tk", newStatus);
  };

  const handlePalestasChange = (event) => {
    const newStatus = event.target.value;
    setPaletas(newStatus);
    saveData("paletas", newStatus);
  };

  const handleSmellChange = (event) => {
    const newSmell = event.target.value;
    setSmell(newSmell);
    saveData("olor", newSmell);
  };

  const handleOtherSmellChange = (event) => {
    const newStatus = event.target.value;
    setOtherSmell(newStatus);
    saveData("otroOlor", newStatus);
  };

  const handleParedesChange = (event) => {
    const newStatus = event.target.value;
    setParedes(newStatus);
    saveData("paredes", newStatus);
  };

  const handlePuertaLateralChange = (event) => {
    const newStatus = event.target.value;
    setPuertaLateral(newStatus);
    saveData("puertaLateral", newStatus);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onEdit !== null) {
      addAlert("Aún tienes un campo por editar", "error");
      return;
    } else navigate("/cc2");
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          <h2>Inspección de vehículo</h2>

          {/* Thermo King */}
          <label htmlFor="tk" className="label-bold">
            Therno King:{" "}
          </label>
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
          {formatEditHistory(currentCarga.editHistory, "tk")}

          {/* Paletas */}
          <label htmlFor="paletas" className="label-bold">
            Paletas:{" "}
          </label>
          <select
            name="paletas"
            id="paletas"
            value={paletas}
            onChange={handlePalestasChange}
          >
            <option value="Si">Sí</option>
            <option value="No">No</option>
          </select>
          {formatEditHistory(currentCarga.editHistory, "paletas")}

          {/* Olor */}
          <label htmlFor="smell" className="label-bold">
            Olor:{" "}
          </label>
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
          {formatEditHistory(currentCarga.editHistory, "olor")}

          {/* Paredes y Techo */}
          <label htmlFor="paredes" className="label-bold">
            Paredes y techo:{" "}
          </label>
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
          {formatEditHistory(currentCarga.editHistory, "paredes")}

          {/* Puerta lateral */}
          <label htmlFor="puertaLateral" className="label-bold">
            Puerta lateral:{" "}
          </label>
          <select
            name="puertaLateral"
            id="puertaLateral"
            value={puertaLateral}
            onChange={handlePuertaLateralChange}
          >
            <option value="Si">Sí</option>
            <option value="No">No</option>
          </select>

          {/* Entidad */}
          <EditableField
            fieldName="entidad"
            label="Entidad"
            value={currentCarga?.entidad}
            placeholder="Ingrese la entidad"
            onSave={saveData}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={capitalizeWords}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
          />

          {/* Responsable */}
          <EditableField
            fieldName="responsable"
            label="Responsable"
            value={currentCarga?.responsable}
            placeholder="Ingrese el responsable"
            onSave={saveData}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={capitalizeWords}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
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
