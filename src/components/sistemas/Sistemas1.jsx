/* eslint-disable react/prop-types */
import { useState } from "react";
import EditableField from "../EditableField";
import { PROVIDER_MAP } from "../../constants/constants";
import { useAuth } from "../login/AuthContext";
import { useGuardar } from "../../hooks/useGuardar";
import LoadingSpinner from "../LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { capitalizeWords } from "../../utils/Capitalizer";
import { checkOnlineStatus } from "../../utils/OnlineStatus";
import { useAlert } from "../alert/AlertContext";
import { useEstados } from "../../contexts/EstadosContext";

const Sistemas1 = () => {
  const { cargas, setCargas, cargaActual, proveedor, setCargaActual } =
    useEstados();
  const { currentUser, loading } = useAuth();
  const key = PROVIDER_MAP[proveedor];
  const currentCarga =
    cargas && cargas[key]?.[cargaActual - 1]
      ? cargas[key][cargaActual - 1]
      : {};
  const guardar = useGuardar(setCargas);
  const navigate = useNavigate();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [onEdit, setOnEdit] = useState(null);
  const { addAlert } = useAlert();

  if ((loading, !currentUser || !cargas)) {
    return <LoadingSpinner />;
  }

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

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
    } else navigate("/sist2");
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form>
          <h2>Crear Unidad</h2>

          {/* Placa */}
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
            defaultValue={currentCarga?.tk || "si"}
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
            <button type="button" onClick={handleContinue}>
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sistemas1;
