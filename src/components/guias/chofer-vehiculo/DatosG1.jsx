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

const DatosG1 = () => {
  const { cargas, updateCargaField, cargaActual, setCargaActual, proveedor } =
    useEstados();
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [onEdit, setOnEdit] = useState(null);
  const { addAlert } = useAlert();
  const key_prov = PROVIDER_MAP[proveedor];
  const [formData, setFormData] = useState(
    cargas[key_prov][cargaActual - 1] || {}
  );

  // Navigation side effect
  useEffect(() => {
    if (!proveedor || !cargaActual) {
      navigate("/despachos");
    }
  }, [proveedor, cargaActual, navigate]);

  // Keep formData in sync with cargas for real-time updates
  useEffect(() => {
    setFormData(cargas[key_prov][cargaActual - 1] || {});
    console.log("Form data updated:", cargas[key_prov][cargaActual - 1]);
  }, [cargas, key_prov, cargaActual]);

  // Single check for loading state
  if (loading || !cargas) return <LoadingSpinner />;

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
      ...formData,
      [name]: value,
      editHistory: {
        ...formData.editHistory,
        [name]: {
          value,
          editedBy: currentUser.name,
          editedAt: new Date().toISOString(),
        },
      },
    };
    setFormData(updatedData);
    await updateCargaField(key_prov, formData.id, updatedData);
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
            {...editableFieldProps({
              fieldName: "chofer",
              label: "Nombre",
              value: formData?.chofer,
              placeholder: "Ingrese el nombre del chofer",
              onSave: handleFieldSave,
              currentUser,
              editHistory: formData?.editHistory,
              setShowSuggestions,
              setOnEdit,
              onEdit,
              formatValue: capitalizeWords,
            })}
          />

          {/****** Cédula ******/}
          <EditableField
            {...editableFieldProps({
              fieldName: "cedula",
              label: "Cédula",
              value: formData?.cedula,
              placeholder: "Ingrese la cédula del chofer",
              onSave: handleFieldSave,
              currentUser,
              editHistory: formData?.editHistory,
              setShowSuggestions,
              setOnEdit,
              onEdit,
              formatValue: (cedula) => {
                const cleanedCedula = cedula.replace(/\D/g, "");
                const parts = [];
                for (let i = cleanedCedula.length; i > 0; i -= 3) {
                  parts.unshift(cleanedCedula.slice(Math.max(0, i - 3), i));
                }
                return parts.join(".");
              },
            })}
          />

          <h2>Vehículo:</h2>

          {/****** Placa ******/}
          <EditableField
            {...editableFieldProps({
              fieldName: "placa",
              label: "Placa",
              value: formData?.placa,
              placeholder: "Ingrese la placa del vehículo",
              onSave: handleFieldSave,
              currentUser,
              editHistory: formData?.editHistory,
              setShowSuggestions,
              setOnEdit,
              onEdit,
              formatValue: (placa) => placa.toUpperCase(),
            })}
          />

          {/****** Marca ******/}
          <EditableField
            {...editableFieldProps({
              fieldName: "marcaVehiculo",
              label: "Marca",
              value: formData?.marcaVehiculo,
              placeholder: "Ingrese la marca del vehículo",
              onSave: handleFieldSave,
              currentUser,
              editHistory: formData?.editHistory,
              setShowSuggestions,
              setOnEdit,
              onEdit,
              formatValue: capitalizeWords,
            })}
          />

          {/****** Therno King ******/}
          <label htmlFor="tk" className="label-bold">
            Therno King:{" "}
          </label>
          <select
            name="tk"
            id="tk"
            value={formData?.tk === "Si" ? "Si" : "No"}
            onChange={handleFieldSave}
          >
            <option value="Si">Sí</option>
            <option value="No">No</option>
          </select>
          {formData.editHistory?.tk && (
            <p className="autor">
              Editado por: {formData.editHistory.tk.editedBy}
              {" a las "}
              {new Date(formData.editHistory.tk.editedAt).toLocaleTimeString(
                "es-ES",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true, // This ensures 24-hour format
                }
              )}
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
