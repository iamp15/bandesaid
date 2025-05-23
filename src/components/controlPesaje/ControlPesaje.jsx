/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PROVIDER_MAP } from "../../constants/constants";
import { useGuardar } from "../../hooks/useGuardar";
import { useAuth } from "../login/AuthContext";
import { useNavigate } from "react-router-dom";
import { checkOnlineStatus } from "../../utils/OnlineStatus";
import { useAlert } from "../alert/AlertContext";
import { useEstados } from "../../contexts/EstadosContext";

const ControlPesaje = () => {
  const { cargas, setCargas, cargaActual, setCargaActual, proveedor } =
    useEstados();
  const key = PROVIDER_MAP[proveedor];
  const currentCarga = cargas[key]?.[cargaActual - 1] || {};
  const guardar = useGuardar(setCargas);
  const [thermoKingStatus, setThermoKingStatus] = useState(
    currentCarga?.tk === "Si" ? "Si" : "No"
  );
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { addAlert } = useAlert();

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  const handleThermoKingChange = (event) => {
    const newStatus = event.target.value;
    setThermoKingStatus(newStatus);
  };

  const handleSubmit = (event) => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }
    event.preventDefault();
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
