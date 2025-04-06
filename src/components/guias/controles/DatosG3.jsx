/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useGuardar } from "../../../hooks/useGuardar";
import { PROVIDER_MAP, MARCA } from "../../../constants/constants";
import { useState } from "react";
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

const DatosG3 = ({ proveedor, cargaActual, cargas, setCargas }) => {
  const guardar = useGuardar(setCargas);
  const currentCarga = cargas[PROVIDER_MAP[proveedor]]?.[cargaActual - 1] || {};
  const [chickenBrand, setChickenBrand] = useState(
    currentCarga?.marca_rubro || MARCA[0].nombre
  );

  const { currentUser, loading } = useAuth();
  const [onEdit, setOnEdit] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { addAlert } = useAlert();

  if (loading) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const new_p_promedio = combinedFormat(currentCarga.p_promedio);

    if (onEdit) {
      alert("Guarda los cambios antes de continuar");
      return;
    }

    if (currentCarga.t_promedio > 0) {
      alert("Alerta: la temperatura promedio debería ser negativa.");
      return;
    }

    if (new_p_promedio < 0) {
      alert("Alerta: el peso promedio debe ser positivo.");
      return;
    }

    navigate("/datosg4");
  };

  const handleChickenBrandChange = (e) => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }
    setChickenBrand(e.target.value);
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
    guardar(proveedor, cargaActual, "", newData);
  };

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
        <form onSubmit={handleSubmit}>
          <h2>Control de Calidad</h2>

          {/****** Marca ******/}
          <SelectorMarca
            chickenBrand={chickenBrand}
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

          {/****** Botones de navegación ******/}
          <div className="button-group">
            <Link to={"/datosg2"}>
              <button>Atras</button>
            </Link>
            <button type="submit">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DatosG3;
