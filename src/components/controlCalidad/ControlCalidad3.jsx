import { useState, useEffect, useRef } from "react";
import { PROVIDER_MAP } from "../../constants/constants";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../login/AuthContext";
import { useAlert } from "../alert/AlertContext";
import SelectorMarca from "../guias/controles/SelectorMarca";
import EditableField from "../EditableField";
import { decimalComma, decimalPeriod } from "../../utils/FormatDecimal";
import { checkOnlineStatus } from "../../utils/OnlineStatus";
import "../../styles/ControlCalidad/ControlCalidad3.css";
import { useEstados } from "../../contexts/EstadosContext";
import LoadingSpinner from "../LoadingSpinner";

const ControlCalidad3 = () => {
  const {
    cargaActual,
    setCargaActual,
    proveedor,
    currentCarga,
    updateCargaField,
    plantaConfig,
  } = useEstados();
  const key_prov = PROVIDER_MAP[proveedor];
  const MARCA = plantaConfig?.MARCA || {};
  const defaultMarca = Object.values(MARCA)[0]?.nombre || "";
  const navigate = useNavigate();
  const [temperaturas, setTemperaturas] = useState(
    currentCarga.temperaturas || []
  );
  const [pesos, setPesos] = useState(currentCarga.pesos || []);
  const muestras = temperaturas.length;
  const [chickenBrand, setChickenBrand] = useState(
    currentCarga.marca_rubro || defaultMarca
  );
  const { currentUser } = useAuth();
  const [onEdit, setOnEdit] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { addAlert, askConfirmation } = useAlert();
  const [showNotification, setShowNotification] = useState(null);
  const [addingSample, setAddingSample] = useState(false);
  const [draftPeso, setDraftPeso] = useState("");
  const [draftTemp, setDraftTemp] = useState("");

  const hydratedCargaId = useRef(null);

  useEffect(() => {
    const { id, temperaturas, pesos } = currentCarga;
    if (!id || hydratedCargaId.current === id) return;
    hydratedCargaId.current = id;
    setTemperaturas(temperaturas || []);
    setPesos(pesos || []);
  }, [currentCarga]);

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  if (!currentUser || !currentCarga || !currentCarga.id) {
    return <LoadingSpinner />;
  }

  const toNumber = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(String(value).replace(",", "."));
    return Number.isNaN(num) ? null : num;
  };

  const promedio = (valores) => {
    if (!valores || valores.length === 0) return null;
    const numeros = valores.map(toNumber).filter((num) => num !== null);
    if (numeros.length === 0) return null;
    const sum = numeros.reduce((acc, num) => acc + num, 0);
    return sum / numeros.length;
  };

  const getCnd = (brandName) => {
    const brand = Object.values(MARCA).find(
      (b) => b.nombre === brandName
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

  const handleAgregarMuestra = () => {
    if (temperaturas.length >= 6) {
      addAlert("Máximo 6 muestras.", "warning");
      return;
    }
    setDraftPeso("");
    setDraftTemp("");
    setAddingSample(true);
  };

  const persistMuestras = (newTemperaturas, newPesos) => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }

    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
    const newData = {
      muestras: newTemperaturas.length,
      temperaturas: newTemperaturas,
      pesos: newPesos,
    };
    updateCargaField(key_prov, currentCarga.id, newData);
  };

  const handleGuardarMuestra = () => {
    const peso = draftPeso.trim();
    const temp = draftTemp.trim();
    if (!peso || !temp) {
      addAlert(
        "Debes completar el peso y la temperatura de la muestra.",
        "warning"
      );
      return;
    }
    const newTemperaturas = [...temperaturas, temp];
    const newPesos = [...pesos, peso];
    setTemperaturas(newTemperaturas);
    setPesos(newPesos);
    setDraftPeso("");
    setDraftTemp("");
    setAddingSample(false);
    persistMuestras(newTemperaturas, newPesos);
  };

  const handleCancelarMuestra = () => {
    setDraftPeso("");
    setDraftTemp("");
    setAddingSample(false);
  };

  const handleQuitarMuestra = (index) => {
    askConfirmation(
      `¿Está seguro de eliminar la muestra ${index + 1}?`,
      (confirmed) => {
        if (!confirmed) return;
        const newTemperaturas = temperaturas.filter((_, i) => i !== index);
        const newPesos = pesos.filter((_, i) => i !== index);
        setTemperaturas(newTemperaturas);
        setPesos(newPesos);
        persistMuestras(newTemperaturas, newPesos);
      }
    );
  };

  const handleChickenBrandChange = (e) => {
    const inputValue = e.target.value;
    setChickenBrand(inputValue);
    saveData("marca_rubro", inputValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }

    if (onEdit !== null) {
      addAlert(
        "Debes terminar de editar el campo antes de continuar",
        "warning"
      );
      return;
    }
    if (addingSample) {
      addAlert(
        "Debes guardar o cancelar la muestra antes de continuar.",
        "warning"
      );
      return;
    }
    const cndNumber = getCnd(chickenBrand);
    const t_promedio = promedio(temperaturas);
    const p_promedio = promedio(pesos);

    if (t_promedio !== null && t_promedio > 0) {
      addAlert(
        "La temperatura promedio debería ser negativa. Revisa los valores.",
        "warning"
      );
      return;
    }
    if (p_promedio !== null && p_promedio < 0) {
      addAlert(
        "El peso promedio debería ser positivo. Revisa los valores.",
        "warning"
      );
      return;
    }
    const newData = {
      ...currentCarga,
      cnd: cndNumber,
      muestras: muestras,
      temperaturas: temperaturas,
      pesos: pesos,
      t_promedio:
        t_promedio === null
          ? null
          : parseFloat(decimalPeriod(t_promedio)).toFixed(1),
      p_promedio:
        p_promedio === null ? null : decimalComma(p_promedio.toFixed(2)),
    };
    updateCargaField(key_prov, currentCarga.id, newData)
      .then(() => {
        navigate("/cc4");
      })
      .catch((error) => {
        addAlert(`Error al guardar la información: ${error.message}`, "error");
      });
  };

  const saveData = (fieldName, newValue) => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }

    const newData = {
      ...currentCarga,
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

  const formatEditHistory = (editHistory, fieldName) => {
    if (!editHistory?.[fieldName]) return null;

    return (
      <p className="autor">
        Editado por: {editHistory[fieldName].editedBy}
        {" a las "}
        {new Date(editHistory[fieldName].editedAt).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true, // This ensures 24-hour format
        })}
      </p>
    );
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          <h2>Control de calidad</h2>

          {/* Marca */}
          <SelectorMarca
            chickenBrand={chickenBrand}
            onChange={handleChickenBrandChange}
          />
          {formatEditHistory(currentCarga.editHistory, "marca_rubro")}

          {/* Lote */}
          <EditableField
            fieldName="lote"
            label="Número de lote"
            value={currentCarga.lote}
            placeholder="Escribe el número de lote"
            onSave={saveData}
            currentUser={currentUser}
            editHistory={currentCarga.editHistory}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
          />

          {/* Fecha de elaboración */}
          <EditableField
            fieldName="felaboracion"
            label="Fecha de elaboración"
            value={currentCarga.felaboracion}
            placeholder="Seleccione la fecha"
            onSave={saveData}
            currentUser={currentUser}
            editHistory={currentCarga.editHistory}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            type="date"
            formatValue={toDisplayDate}
            formatEditValue={toDateInputValue}
            parseEditValue={toDisplayDate}
            emptyText="N/A"
          />

          <hr className="section-divider" />

          {/* Muestras */}
          <div className="section-g4">
            <h2>Muestras</h2>

            {muestras > 0 && (
              <div className="lista-muestras">
                {temperaturas.map((temp, index) => (
                  <div key={index} className="lista-item">
                    <span className="lista-item-text">
                      Muestra {index + 1}: {pesos[index]} kg / {temp} ºC
                    </span>
                    <div className="lista-item-actions">
                      <button
                        type="button"
                        className="btn-eliminar"
                        onClick={() => handleQuitarMuestra(index)}
                        title="Eliminar muestra"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showNotification && (
              <div className="notificacion">¡Información guardada!</div>
            )}

            {addingSample ? (
              <div className="inline-add-form">
                <label>Peso de la muestra:</label>
                <input
                  type="text"
                  value={draftPeso}
                  onChange={(e) => setDraftPeso(e.target.value)}
                  placeholder="Ingrese el peso"
                />
                <label>Temperatura de la muestra:</label>
                <input
                  type="text"
                  value={draftTemp}
                  onChange={(e) => setDraftTemp(e.target.value)}
                  placeholder="Ingrese la temperatura"
                />
                <div className="inline-add-buttons">
                  <button
                    type="button"
                    onClick={handleCancelarMuestra}
                    className="btn-cancelar"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardarMuestra}
                    className="btn-agregar"
                  >
                    Guardar muestra
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn-agregar-guia-precinto"
                onClick={handleAgregarMuestra}
                disabled={muestras >= 6}
              >
                + Agregar muestra
              </button>
            )}
          </div>

          <div className="button-group">
            <button
              onClick={() => {
                setCargaActual(0);
                navigate("/carga");
              }}
            >
              Volver
            </button>
            <button type="submit">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ControlCalidad3;
