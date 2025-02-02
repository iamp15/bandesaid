/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PROVIDER_MAP } from "../../constants/constants";
import { useGuardar } from "../../hooks/useGuardar";
import { useAuth } from "../login/AuthContext";
import EditableField from "../EditableField";

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
  const { currentUser } = useAuth();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [onEdit, setOnEdit] = useState(null);

  const handleThermoKingChange = (event) => {
    const newStatus = event.target.value;
    setThermoKingStatus(newStatus);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onEdit) {
      alert("Por favor, guarda los cambios antes de continuar");
      return;
    }
    const newData = {
      tk: thermoKingStatus,
      editHistory: {
        ...currentCarga?.editHistory,
        tk: {
          value: thermoKingStatus,
          editedBy: currentUser.name,
          editedAt: new Date().toISOString(),
        },
      },
    };

    guardar(proveedor, cargaActual, "/pesaje2", newData);
  };

  const handleFieldSave = (fieldName, newValue) => {
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

          {currentCarga.editHistory?.tk && (
            <p className="autor">
              Editado por: {currentCarga.editHistory.tk.editedBy}
              {" a las "}
              {new Date(
                currentCarga.editHistory.tk.editedAt
              ).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true, // This ensures 24-hour format
              })}
            </p>
          )}

          {/*****ID unidad******/}
          <EditableField
            fieldName="id_unidad"
            label="ID Unidad"
            value={currentCarga.id_unidad}
            onSave={handleFieldSave}
            placeholder={"Ingresa el ID de la unidad"}
            currentUser={currentUser}
            editHistory={currentCarga.editHistory}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            setShowSuggestions={setShowSuggestions}
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
