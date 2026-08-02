import { PROVIDER_MAP } from "../../../constants/constants";
import { useState, useEffect } from "react";
import SelectorMarca from "./SelectorMarca";
import { decimalComma, decimalPeriod } from "../../../utils/FormatDecimal";
import { formatNumber } from "../../../utils/FormatNumber";
import "../../../styles/guias/DatosG3.css";
import { useAuth } from "../../login/AuthContext";
import LoadingSpinner from "../../LoadingSpinner";
import EditableField from "../../EditableField";
import { useNavigate } from "react-router-dom";
import { checkOnlineStatus } from "../../../utils/OnlineStatus";
import { useAlert } from "../../alert/AlertContext";
import { useEstados } from "../../../contexts/EstadosContext";
import { useGuiaTabs } from "../GuiaTabsLayout";

const DatosG3 = () => {
  const { cargaActual, proveedor, updateCargaField, currentCarga, plantaConfig } =
    useEstados();
  const key_prov = PROVIDER_MAP[proveedor];
  const MARCA = plantaConfig?.MARCA || {};
  const { currentUser, loading } = useAuth();
  const [onEdit, setOnEdit] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { addAlert } = useAlert();
  const { setIsEditing } = useGuiaTabs() || {};

  // Reportar al layout si hay una edición en curso para bloquear el cambio de pestaña
  useEffect(() => {
    setIsEditing?.(onEdit !== null);
    return () => setIsEditing?.(false);
  }, [onEdit, setIsEditing]);

  // Early return for loading state
  if (loading || !currentUser || !currentCarga || !currentCarga.id) {
    return <LoadingSpinner />;
  }

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  const getCnd = (brandName) => {
    const brand = Object.values(MARCA).find(
      (brand) => brand.nombre === brandName
    );
    return brand ? brand.CND : null;
  };

  const toDateInputValue = (value) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parts = String(value).split("/");
    if (parts.length !== 3) return "";
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
  };

  const toDisplayDate = (value) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [yyyy, mm, dd] = value.split("-");
      return `${dd}/${mm}/${yyyy}`;
    }
    return value;
  };

  const handleChickenBrandChange = (e) => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }
    const newData = {
      marca_rubro: e.target.value,
      cnd: getCnd(e.target.value),
      editHistory: {
        ...currentCarga?.editHistory,
        marca_rubro: {
          value: e.target.value,
          editedBy: currentUser.name,
          editedAt: new Date().toISOString(),
        },
      },
    };
    updateCargaField(key_prov, currentCarga.id, newData);
  };

  const handleFieldSave = (name, value) => {
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
    updateCargaField(key_prov, currentCarga.id, updatedData);
  };

  const combinedFormat = (value) => {
    if (value && value.includes(",")) {
      value = value.replace(",", ".");
    }
    const formattedValue = decimalPeriod(value);
    return parseFloat(formattedValue).toFixed(1);
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={(e) => e.preventDefault()}>
          <h2>Control de Calidad</h2>

          {/****** Marca ******/}
          <SelectorMarca
            chickenBrand={currentCarga?.marca_rubro || Object.values(MARCA)[0]?.nombre}
            onChange={handleChickenBrandChange}
          />
          {currentCarga.editHistory?.marca_rubro && (
            <p className="autor autor-marca">
              Editado por: {currentCarga.editHistory.marca_rubro.editedBy}
              {" a las "}
              {new Date(
                currentCarga.editHistory.marca_rubro.editedAt
              ).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true, // This ensures 24-hour format
              })}
            </p>
          )}

          {/****** Lote ******/}
          <EditableField
            fieldName="lote"
            label="Número de lote"
            value={currentCarga?.lote}
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={(val) => val.toUpperCase()}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
          />

          {/****** Fecha de elaboración ******/}
          <EditableField
            fieldName="felaboracion"
            label="Fecha de elaboración"
            value={currentCarga?.felaboracion}
            placeholder="Seleccione la fecha"
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            type="date"
            formatValue={toDisplayDate}
            formatEditValue={toDateInputValue}
            parseEditValue={toDisplayDate}
            emptyText="N/A"
          />

          {/****** Peso promedio ******/}
          <EditableField
            fieldName="p_promedio"
            label="Peso promedio"
            value={currentCarga?.p_promedio}
            placeholder="Peso promedio del rubro"
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={decimalComma}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            unit="kg"
          />

          {/****** Temperatura promedio ******/}
          <EditableField
            fieldName="t_promedio"
            label="Temperatura promedio"
            value={currentCarga?.t_promedio}
            placeholder="Temperatura promedio del rubro"
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={combinedFormat}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            unit="°C"
          />

          <h2>Control de Peso</h2>

          {/****** Peso total de la carga ******/}
          <EditableField
            fieldName="p_total"
            label="Peso total de la carga"
            value={currentCarga?.p_total}
            placeholder="Ejemplo: 10000"
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={formatNumber}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            unit="kg"
          />

          {/****** Peso verificado ******/}
          <EditableField
            fieldName="p_verificado"
            label="Peso verificado"
            value={currentCarga?.p_verificado}
            placeholder="Ejemplo: 10000.5"
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={formatNumber}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            unit="kg"
          />
        </form>
      </div>
    </div>
  );
};

export default DatosG3;
