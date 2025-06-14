/* eslint-disable react/prop-types */
import BotonCopiar from "../BotonCopiar";
import { useGuardar } from "../../hooks/useGuardar";
import { PROVIDER_MAP, GALPON, RUBRO } from "../../constants/constants";
import { formatNumber } from "../../utils/FormatNumber";
import { Link } from "react-router-dom";
import EditableField from "../EditableField";
import { useAuth } from "../login/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkOnlineStatus } from "../../utils/OnlineStatus";
import { useAlert } from "../alert/AlertContext";
import "../../styles/pesaje/ControlPesaje2.css";
import { useEstados } from "../../contexts/EstadosContext";
import LoadingSpinner from "../LoadingSpinner";

const ControlPesaje2 = () => {
  const { cargas, setCargas, cargaActual, proveedor } = useEstados();
  const key = PROVIDER_MAP[proveedor];
  const currentCarga = cargas ? cargas[key]?.[cargaActual - 1] : {};
  const guardar = useGuardar(setCargas);
  const { currentUser } = useAuth();
  const [onEdit, setOnEdit] = useState(null);
  const navigate = useNavigate();
  const { addAlert } = useAlert();
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  if (!currentUser || !cargas) {
    return (
      <div className="wrap-container">
        <div className="menu">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onEdit) {
      alert("Por favor, guarda los cambios antes de continuar");
      return;
    }

    // Warn if difference between p_total and p_verificado is greater than 5
    const parseNumber = (val) => {
      if (typeof val === "string") {
        return Number(val.replace(/\./g, "").replace(",", "."));
      }
      return Number(val);
    };
    const pTotal = parseNumber(currentCarga?.p_total);
    const pVerificado = parseNumber(currentCarga?.p_verificado);
    if (
      !isNaN(pTotal) &&
      !isNaN(pVerificado) &&
      Math.abs(pTotal - pVerificado) > 5
    ) {
      addAlert(
        "La diferencia entre el peso total y el peso verificado es mayor a 5 kg. Por favor, revisa los valores.",
        "warning"
      );
      return;
    }

    navigate("/pesaje3");
  };

  const inicioCargaText = () => {
    const numeracion = () => {
      if (cargaActual < 10) {
        return "0" + cargaActual;
      } else {
        return cargaActual;
      }
    };
    return (
      "*INICIO DE CARGA  👀*\n" +
      `*CARGA Nº ${numeracion()}*\n` +
      `*Proveedor:* ${proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Rubro:* ${RUBRO}\n` +
      `*Thermo King:* ${currentCarga.tk}\n` +
      `*Fecha:* ${currentCarga.fecha}\n`
    );
  };

  const cargaFinalizadaText = () => {
    const numeracion = () => {
      if (cargaActual < 10) {
        return "0" + cargaActual;
      } else {
        return cargaActual;
      }
    };
    return (
      `*CARGA Nº ${numeracion()}*\n` +
      `*Proveedor:* ${proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Rubro:* ${RUBRO}\n` +
      `*Fecha:* ${currentCarga.fecha}\n` +
      "\n✓ Carga finalizada.\n" +
      `🆔: ${currentCarga.id_unidad}`
    );
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

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          <h2>Formatos iniciales:</h2>

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

          <div className="copy-buttons">
            <BotonCopiar text1={inicioCargaText()} text2="Inicio de carga" />
            <BotonCopiar
              text1={cargaFinalizadaText()}
              text2="Carga finalizada"
            />
          </div>

          <h2>Pesaje:</h2>

          <EditableField
            fieldName="p_total"
            label="Peso total de la carga"
            value={currentCarga?.p_total}
            placeholder={"Ej: 10000"}
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={formatNumber}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            setShowSuggestions={setShowSuggestions}
          />

          <EditableField
            fieldName="p_verificado"
            label="Peso verificado"
            value={currentCarga?.p_verificado}
            placeholder={"Ej: 10000,42"}
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={formatNumber}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            setShowSuggestions={setShowSuggestions}
          />

          <div className="button-group">
            <Link to={"/pesaje1"}>
              <button>Atras</button>
            </Link>
            <button type="submit">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ControlPesaje2;
