import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../login/AuthContext";
import { useNavigate } from "react-router-dom";
import { checkOnlineStatus } from "../../utils/OnlineStatus";
import { useAlert } from "../alert/AlertContext";
import { useEstados } from "../../contexts/EstadosContext";
import LoadingSpinner from "../LoadingSpinner";
import { PROVIDER_MAP } from "../../constants/constants";

const ControlPesaje = () => {
  const {
    cargaActual,
    setCargaActual,
    proveedor,
    currentCarga,
    updateCargaField,
  } = useEstados();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { addAlert } = useAlert();
  const key_prov = PROVIDER_MAP[proveedor];

  // Always sync thermoKingStatus with currentCarga.tk
  const [thermoKingStatus, setThermoKingStatus] = useState(
    currentCarga?.tk === "Si" ? "Si" : "No"
  );

  // Sync thermoKingStatus with currentCarga.tk when currentCarga changes
  useEffect(() => {
    setThermoKingStatus(currentCarga?.tk === "Si" ? "Si" : "No");
  }, [currentCarga?.tk]);

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  if (!currentCarga || !currentCarga.id) return <LoadingSpinner />;

  const handleThermoKingChange = (event) => {
    const newStatus = event.target.value;
    setThermoKingStatus(newStatus);
    saveData("tk", newStatus);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }
    navigate("/pesaje2");
  };

  const saveData = async (fieldName, newValue) => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }
    const updatedData = {
      ...currentCarga,
      [fieldName]: newValue,
      editHistory: {
        ...currentCarga.editHistory,
        [fieldName]: {
          value: newValue,
          editedBy: currentUser.name,
          editedAt: new Date().toISOString(),
        },
      },
    };
    await updateCargaField(key_prov, currentCarga.id, updatedData);
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
