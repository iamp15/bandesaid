/* eslint-disable react/prop-types */
import { useState } from "react";
import { useAuth } from "../login/AuthContext";
import { useGuardar } from "../../hooks/useGuardar";
import { useNavigate } from "react-router-dom";
import { PROVIDER_MAP } from "../../constants/constants";
import LoadingSpinner from "../LoadingSpinner";
import EditableField from "../EditableField";
import { decimalComma } from "../../utils/FormatDecimal";
import { Link } from "react-router-dom";

const Sistemas2 = ({ cargaActual, proveedor, cargas, setCargas }) => {
  const { currentUser, loading } = useAuth();
  const key = PROVIDER_MAP[proveedor];
  const currentCarga = cargas[key]?.[cargaActual - 1] || {};
  const guardar = useGuardar(setCargas);
  const navigate = useNavigate();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [onEdit, setOnEdit] = useState(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

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

  const handleContinue = () => {
    if (onEdit !== null) {
      alert("Por favor, guarda los cambios antes de continuar");
      return;
    } else navigate("/carga");
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form>
          <h2>Control de Calidad</h2>

          {/* Temperatura Promedio */}
          <EditableField
            fieldName="t_promedio"
            label="Temperatura Promedio"
            value={currentCarga?.t_promedio}
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            formatValue={decimalComma}
          />

          {/*****Peso promedio *****/}
          <EditableField
            fieldName="p_promedio"
            label="Peso Promedio"
            value={currentCarga?.p_promedio}
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            formatValue={decimalComma}
          />

          <h2>Despacho de Vehículos</h2>
          <EditableField
            fieldName="marca_rubro"
            label="Marca de Rubro"
            value={currentCarga?.marca_rubro}
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
          />

          {/*****Núme*****/}

          {/****** Botones ******/}
          <div className="button-group">
            <Link to={"/sist1"}>
              <button type="button">Atras</button>
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

export default Sistemas2;
