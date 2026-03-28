/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { PROVIDER_MAP } from "../../../constants/constants";
import { capitalizeWords } from "../../../utils/Capitalizer";
import "../../../styles/guias/DatosG1.css";
import { useAuth } from "../../login/AuthContext";
import EditableField from "../../EditableField";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoadingSpinner from "../../LoadingSpinner";
import { checkOnlineStatus } from "../../../utils/OnlineStatus";
import { useAlert } from "../../alert/AlertContext";
import { useEstados } from "../../../contexts/EstadosContext";
import { editableFieldProps } from "../../../utils/editableFieldProps";
import SelectorChofer from "../../configuracion/SelectorChofer";
import SelectorCamion from "../../configuracion/SelectorCamion";

const DatosG1 = () => {
  const {
    updateCargaField,
    cargaActual,
    setCargaActual,
    proveedor,
    currentCarga,
  } = useEstados();
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [onEdit, setOnEdit] = useState(null);
  const { addAlert } = useAlert();
  const key_prov = PROVIDER_MAP[proveedor];

  // Estados para los selectores de chofer y camión
  const [selectedChofer, setSelectedChofer] = useState(null);
  const [selectedCamion, setSelectedCamion] = useState(null);

  // Inicializar selectores con datos existentes de la carga
  useEffect(() => {
    if (currentCarga?.choferId || currentCarga?.choferNombre) {
      setSelectedChofer({
        id: currentCarga.choferId,
        nombre: currentCarga.choferNombre || currentCarga.chofer,
        cedula: currentCarga.cedula,
      });
    }
    if (currentCarga?.camionId || currentCarga?.placa) {
      setSelectedCamion({
        id: currentCarga.camionId,
        placa: currentCarga.placa,
        marca: currentCarga.marcaVehiculo,
      });
    }
  }, [currentCarga]);

  // Navigation side effect
  useEffect(() => {
    if (!proveedor || !cargaActual) {
      navigate("/despachos");
    }
  }, [proveedor, cargaActual, navigate]);

  // Single check for loading state
  if (loading || !currentCarga || !currentCarga.id) return <LoadingSpinner />;

  // Helper for online status check
  const requireOnline = () => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return false;
    }
    return true;
  };

  const handleFieldSave = async (name, value) => {
    if (!requireOnline()) return;
    const updatedData = {
      ...currentCarga,
      [name]: value,
      editHistory: {
        ...currentCarga.editHistory,
        [name]: {
          value,
          editedBy: currentUser.name,
          editedAt: new Date().toISOString(),
        },
      },
    };
    await updateCargaField(key_prov, currentCarga.id, updatedData);
  };

  // Handler para guardar campos desde los selectores
  const handleSelectorSave = async (fieldName, value) => {
    if (!requireOnline()) return;
    const updatedData = {
      [fieldName]: value,
      editHistory: {
        ...currentCarga.editHistory,
        [fieldName]: {
          value,
          editedBy: currentUser.name,
          editedAt: new Date().toISOString(),
        },
      },
    };
    await updateCargaField(key_prov, currentCarga.id, updatedData);
  };

  const handleContinue = () => {
    if (onEdit !== null) {
      alert("Por favor, guarda los cambios antes de continuar");
      return;
    } else navigate("/datosg2");
  };

  const handleTkChange = async (e) => {
    if (!requireOnline()) return;
    const value = e.target.value;
    const updatedData = {
      ...currentCarga,
      tk: value,
      editHistory: {
        ...currentCarga.editHistory,
        tk: {
          value,
          editedBy: currentUser.name,
          editedAt: new Date().toISOString(),
        },
      },
    };
    await updateCargaField(key_prov, currentCarga.id, {
      tk: value,
      editHistory: updatedData.editHistory,
    });
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form>
          <h2>Chofer:</h2>

          {/***** Selector de Chofer *****/}
          <label className="label-bold">Seleccionar Chofer:</label>
          <SelectorChofer
            value={selectedChofer}
            onChange={setSelectedChofer}
            onSave={handleSelectorSave}
            fieldName="chofer"
          />

          <h2>Vehículo:</h2>

          {/***** Selector de Camión *****/}
          <label className="label-bold">Seleccionar Camión:</label>
          <SelectorCamion
            value={selectedCamion}
            onChange={setSelectedCamion}
            onSave={handleSelectorSave}
            fieldName="camion"
          />

          {/****** ID de unidad ******/}
          <EditableField
            {...editableFieldProps({
              fieldName: "id_unidad",
              label: "ID de unidad",
              value: currentCarga?.id_unidad,
              placeholder: "Ingrese el ID de la unidad",
              onSave: handleFieldSave,
              currentUser,
              editHistory: currentCarga?.editHistory,
              setShowSuggestions,
              setOnEdit,
              onEdit,
            })}
          />

          {/****** Therno King ******/}
          <label htmlFor="tk" className="label-bold">
            Therno King:{" "}
          </label>
          <select
            name="tk"
            id="tk"
            value={currentCarga?.tk === "Si" ? "Si" : "No"}
            onChange={handleTkChange}
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
