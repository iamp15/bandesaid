/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { PROVIDER_MAP } from "../../../constants/constants";
import { useGuardar } from "../../../hooks/useGuardar";
import { capitalizeWords } from "../../../utils/Capitalizer";
import "../../../styles/guias/DatosG1.css";
import { useAuth } from "../../login/AuthContext";
import EditableField from "../../EditableField";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LoadingSpinner from "../../LoadingSpinner";
import { checkOnlineStatus } from "../../../utils/OnlineStatus";
import { useAlert } from "../../alert/AlertContext";
import { useEstados } from "../../../contexts/EstadosContext";

const DatosG1 = () => {
  const { cargas, setCargas, cargaActual, setCargaActual, proveedor } =
    useEstados();
  const guardar = useGuardar(setCargas);
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [onEdit, setOnEdit] = useState(null);
  const { addAlert } = useAlert();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!proveedor)
    return (
      <div className="error">
        <span>���️</span>
        <p>Aun no has seleccionado un proveedor</p>
        <div className="button-group">
          <Link to="/proveedor">
            <button>Volver</button>
          </Link>
        </div>
      </div>
    );

  const key = PROVIDER_MAP[proveedor];

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  // Get the current carga based on cargaActual and proveedor
  const currentCarga = cargas[key]?.[cargaActual - 1] || {};

  const handleFieldSave = (fieldName, newValue) => {
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

  const tkChange = (e) => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }
    const newData = {
      tk: e.target.value,
      editHistory: {
        ...currentCarga?.editHistory,
        tk: {
          value: e.target.value,
          editedBy: currentUser.name,
          editedAt: new Date().toISOString(),
        },
      },
    };
    guardar(proveedor, cargaActual, "", newData);
  };

  const handleContinue = () => {
    if (onEdit !== null) {
      alert("Por favor, guarda los cambios antes de continuar");
      return;
    } else navigate("/datosg2");
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form>
          <h2>Chofer:</h2>

          {/*****nombre*****/}
          <EditableField
            fieldName="chofer"
            label="Nombre"
            value={currentCarga?.chofer}
            placeholder="Ingrese el nombre del chofer"
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={capitalizeWords}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
          />

          {/****** Cédula ******/}
          <EditableField
            fieldName="cedula"
            label="Cédula"
            value={currentCarga?.cedula}
            placeholder="Ingrese la cédula del chofer"
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            formatValue={(cedula) => {
              // Remove any existing non-digit characters
              const cleanedCedula = cedula.replace(/\D/g, "");

              // Add dots to the cleaned cedula
              const parts = [];
              for (let i = cleanedCedula.length; i > 0; i -= 3) {
                parts.unshift(cleanedCedula.slice(Math.max(0, i - 3), i));
              }

              return parts.join(".");
            }}
          />

          <h2>Vehículo:</h2>

          {/****** Placa ******/}
          <EditableField
            fieldName="placa"
            label="Placa"
            value={currentCarga?.placa}
            placeholder="Ingrese la placa del vehículo"
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={(placa) => placa.toUpperCase()}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
          />

          {/****** Marca ******/}
          <EditableField
            fieldName="marcaVehiculo"
            label="Marca"
            value={currentCarga?.marcaVehiculo}
            placeholder="Ingrese la marca del vehículo"
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={capitalizeWords}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
          />

          {/****** Therno King ******/}
          <label htmlFor="tk" className="label-bold">
            Therno King:{" "}
          </label>
          <select
            name="tk"
            id="tk"
            value={currentCarga?.tk === "Si" ? "Si" : "No"}
            onChange={tkChange}
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
            <button type="button" onClick={handleContinue}>
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DatosG1;
