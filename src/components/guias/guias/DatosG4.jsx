import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PROVIDER_MAP } from "../../../constants/constants";
import { formatNumber } from "../../../utils/FormatNumber";
import { useAuth } from "../../login/AuthContext";
import "../../../styles/guias/DatosG4.css";
import LoadingSpinner from "../../LoadingSpinner";
import EditableField from "../../EditableField";
import { useNavigate } from "react-router-dom";
import { checkOnlineStatus } from "../../../utils/OnlineStatus";
import { useAlert } from "../../alert/AlertContext";
import { useEstados } from "../../../contexts/EstadosContext";

const DatosG4 = () => {
  const { cargaActual, proveedor, updateCargaField, currentCarga } =
    useEstados();
  const { loading, currentUser } = useAuth();
  const [showNotification, setShowNotification] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [onEdit, setOnEdit] = useState(null);
  const navigate = useNavigate();
  const { addAlert } = useAlert();
  const [amountGuias, setAmountGuias] = useState(0);
  const [amountPrecintos, setAmountPrecintos] = useState(0);
  const [numGuias, setNumGuias] = useState([0]);
  const [pesosGuias, setPesosGuias] = useState([0]);
  const [precintos, setPrecintos] = useState(["S/P"]);
  const key_prov = PROVIDER_MAP[proveedor];

  useEffect(() => {
    setNumGuias(currentCarga.codigos_guias || []);
    setPesosGuias(currentCarga.pesos_guias || []);
    setAmountGuias(currentCarga.codigos_guias?.length || 0);
    setAmountPrecintos(currentCarga.precintos?.length || 0);
    setPrecintos(currentCarga.precintos || ["S/P"]);
  }, [currentCarga]);

  if (loading || !currentUser || !currentCarga || !currentCarga.id) {
    return <LoadingSpinner />;
  }

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }

    if (onEdit) {
      alert("Por favor, guarda los cambios antes de continuar");
      return;
    }

    navigate("/revisionguias");
  };

  const handleGuiasChange = (e) => {
    const value = Number(e.target.value);
    if (value < 0) return;
    setAmountGuias(value);
    // Adjust arrays to match new number of guias
    setNumGuias((prev) =>
      Array.from({ length: value }, (_, i) => prev[i] ?? "")
    );
    setPesosGuias((prev) =>
      Array.from({ length: value }, (_, i) => prev[i] ?? "")
    );
  };

  // Update: split handlePrecintosChange into two functions:
  // 1. For changing the amount (input number)
  // 2. For changing the value of each precinto (input text)

  // Handles the amount of precintos
  const handlePrecintosAmountChange = (e) => {
    const value = Number(e.target.value);
    if (value < 0) return;
    setAmountPrecintos(value);
    setPrecintos((prev) =>
      Array.from({ length: value }, (_, i) => prev[i] ?? "")
    );
  };

  // Handles the value of each precinto
  const handlePrecintoValueChange = (idx, val) => {
    setPrecintos((prev) => {
      const arr = [...prev];
      arr[idx] = val;
      return arr;
    });
  };

  const handleCodigoChange = (idx, val) => {
    setNumGuias((prev) => {
      const arr = [...prev];
      arr[idx] = val;
      return arr;
    });
  };

  const handlePesoChange = (idx, val) => {
    setPesosGuias((prev) => prev.map((p, i) => (i === idx ? val : p)));
  };

  const parsePeso = (pesoStr) => {
    const parts = pesoStr.split(",");
    if (parts.length > 1) {
      const integerPart = parts.slice(0, -1).join("").replace(/\./g, "");
      const decimalPart = parts[parts.length - 1];
      const finalValue = parseFloat(`${integerPart}.${decimalPart}`);

      return finalValue;
    }
    const finalValue = parseFloat(pesoStr.replace(/\./g, "").replace(",", "."));
    return finalValue;
  };

  const checkPesos = () => {
    const sumPesos =
      pesosGuias.reduce((acc, peso) => acc + parsePeso(peso), 0) || 0;
    const pesoTotal = parsePeso(currentCarga.p_total) || 0;

    if (sumPesos !== pesoTotal) {
      alert(
        `Por favor verifique los pesos de las guías, la suma debiría ser igual a ${pesoTotal}.`
      );
      return false;
    }

    return true;
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
    updateCargaField(key_prov, currentCarga.id, newData);
  };

  // Save guias codes and weights to Firestore when clicking "Guardar"
  const saveGuias = () => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }

    if (amountGuias > 1 && !checkPesos()) {
      return;
    }

    const newData = {
      codigos_guias: numGuias,
      pesos_guias: pesosGuias.map((peso) => (peso ? formatNumber(peso) : "")),
    };

    updateCargaField(key_prov, currentCarga.id, newData).then(() => {
      setShowNotification("button1");
      setTimeout(() => setShowNotification(null), 2000);
    });
  };

  // Save precintos to Firestore when clicking "Guardar"
  const savePrecintos = () => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }
    const newData = {
      precintos: precintos.length > 0 ? precintos : ["S/P"],
    };
    updateCargaField(key_prov, currentCarga.id, newData).then(() => {
      setShowNotification("button2");
      setTimeout(() => setShowNotification(null), 2000);
    });
  };

  if (showSuggestions) true;

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          <div className="number-input-container">
            <h2>Datos Guía</h2>
            <label htmlFor="n_guias">Cantidad de guías: </label>
            <input
              type="number"
              id="n_guias"
              min={0}
              max={15}
              step={1}
              value={amountGuias === 0 ? "" : amountGuias}
              onChange={handleGuiasChange}
              placeholder="Ingrese la cantidad de guías"
            />
          </div>

          {/* Conditionally render guia fields */}
          {amountGuias === 1 && (
            <div className="guia-fields">
              <label>Código de guía:</label>
              <input
                type="text"
                maxLength={9}
                value={numGuias[0] || ""}
                onChange={(e) => handleCodigoChange(0, e.target.value)}
                placeholder="Ingrese código de guía (9 dígitos)"
              />
            </div>
          )}

          {amountGuias > 1 && (
            <div className="guia-fields-multiple">
              {Array.from({ length: amountGuias }).map((_, idx) => (
                <div key={idx} className="guia-set">
                  <label>Código de guía #{idx + 1}:</label>
                  <input
                    type="text"
                    maxLength={9}
                    value={numGuias[idx] || ""}
                    onChange={(e) => handleCodigoChange(idx, e.target.value)}
                    placeholder="Ingrese código de guía"
                  />
                  <label>Peso guía #{idx + 1}:</label>
                  <input
                    type="text"
                    value={pesosGuias[idx] || ""}
                    onChange={(e) => handlePesoChange(idx, e.target.value)}
                    placeholder="Ingrese peso de la guía"
                  />
                </div>
              ))}
            </div>
          )}

          {amountGuias > 0 && (
            <div className="button-group">
              {showNotification === "button1" && (
                <div className="notificacion">¡Información guardada!</div>
              )}
              <button type="button" onClick={saveGuias}>
                Guardar
              </button>
            </div>
          )}

          {/* Datos Precintos */}
          <div className="number-input-container">
            <h2>Datos Precintos</h2>
            <label htmlFor="n_precintos">Cantidad de precintos: </label>
            <input
              type="number"
              id="n_precintos"
              min={0}
              max={15}
              step={1}
              value={amountPrecintos === 0 ? "" : amountPrecintos}
              onChange={handlePrecintosAmountChange}
              placeholder="Ingrese la cantidad de precintos"
            />
          </div>

          {amountPrecintos > 0 && (
            <div className="precintos-fields-multiple">
              {Array.from({ length: amountPrecintos }).map((_, idx) => (
                <div key={idx} className="precinto-set">
                  <label>Código de precinto #{idx + 1}:</label>
                  <input
                    type="text"
                    maxLength={8}
                    value={precintos[idx] || ""}
                    onChange={(e) =>
                      handlePrecintoValueChange(idx, e.target.value)
                    }
                    placeholder="Ingrese código de precinto"
                  />
                </div>
              ))}
            </div>
          )}

          {amountPrecintos > 0 && (
            <div className="button-group">
              {showNotification === "button2" && (
                <div className="notificacion">¡Información guardada!</div>
              )}
              <button type="button" onClick={savePrecintos}>
                Guardar
              </button>
            </div>
          )}

          {/*****ID unidad******/}
          <EditableField
            fieldName="id_despacho"
            label="ID despacho"
            value={currentCarga.id_despacho ?? ""}
            onSave={handleFieldSave}
            placeholder={"Ingresa el ID del despacho"}
            currentUser={currentUser}
            editHistory={currentCarga.editHistory}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            setShowSuggestions={setShowSuggestions}
          />

          <div className="button-group">
            <Link to={"/datosg3"}>
              <button type="button">Atras</button>
            </Link>
            <button type="submit">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DatosG4;
