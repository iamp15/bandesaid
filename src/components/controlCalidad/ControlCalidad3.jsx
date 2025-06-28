import { useState, useEffect } from "react";
import { PROVIDER_MAP, MARCA } from "../../constants/constants";
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
  } = useEstados();
  const key_prov = PROVIDER_MAP[proveedor];
  const navigate = useNavigate();
  const [muestras, setMuestras] = useState(0);
  const [temperaturas, setTemperaturas] = useState(
    currentCarga.temperaturas || []
  );
  const [pesos, setPesos] = useState(currentCarga.pesos || []);
  const [chickenBrand, setChickenBrand] = useState(
    currentCarga.marca_rubro || "San José"
  );
  const { currentUser } = useAuth();
  const [onEdit, setOnEdit] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { addAlert } = useAlert();
  const [showNotification, setShowNotification] = useState(null);

  useEffect(() => {
    if (currentCarga.muestras) {
      setMuestras(currentCarga.muestras);
      setTemperaturas(currentCarga.temperaturas || []);
      setPesos(currentCarga.pesos || []);
    }
  }, [currentCarga]);

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  if (!currentUser || !currentCarga || !currentCarga.id) {
    return <LoadingSpinner />;
  }

  const promedio = (valores) => {
    if (!valores || valores.length === 0) return 0;
    if (valores.length === 1) return valores[0];
    const sum = valores.reduce((acc, temp) => acc + temp, 0);
    return sum / valores.length;
  };

  const getCnd = (brandName) => {
    const brand = Object.values(MARCA).find(
      (brand) => brand.nombre === brandName
    );
    return brand ? brand.CND : null;
  };

  const handleMuestrasChange = (e) => {
    const inputValue = e.target.value;
    const newMuestrasValue =
      inputValue === "" ? "" : Math.min(Math.max(0, Number(inputValue)), 6);

    setMuestras(newMuestrasValue);
    setTemperaturas(new Array(newMuestrasValue).fill(""));
    setPesos(new Array(newMuestrasValue).fill(""));
  };

  const handleTemperaturaChange = (index, value) => {
    const newTemperaturas = [...temperaturas];
    const formattedValue = value.replace(",", ".");
    newTemperaturas[index] = Number(formattedValue);
    setTemperaturas(newTemperaturas);
  };

  const handlePesoChange = (index, value) => {
    const newPesos = [...pesos];
    const formattedValue = value.replace(",", ".");
    newPesos[index] = Number(formattedValue);
    setPesos(newPesos);
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
    const cndNumber = getCnd(chickenBrand);
    const t_promedio = temperaturas.length ? promedio(temperaturas) : null;
    const p_promedio = pesos.length ? promedio(pesos) : null;

    if (t_promedio > 0) {
      addAlert(
        "La temperatura promedio debería ser negativa. Revisa los valores.",
        "warning"
      );
      return;
    }
    if (p_promedio < 0) {
      addAlert(
        "El peso promedio debería ser positivo. Revisa los valores.",
        "warning"
      );
      return;
    }
    const newData = {
      ...currentCarga,
      cnd: cndNumber,
      muestras: Number(muestras),
      temperaturas: temperaturas,
      pesos: pesos,
      t_promedio: parseFloat(decimalPeriod(t_promedio)).toFixed(1),
      p_promedio: decimalComma(p_promedio.toFixed(2)),
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

  const saveInfo = () => {
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
      muestras: Number(muestras),
      temperaturas: temperaturas,
      pesos: pesos,
    };
    updateCargaField(key_prov, currentCarga.id, newData);
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

          {/* Muestras */}
          <label htmlFor="muestras">Cantidad de muestras: </label>
          <input
            type="number"
            id="muestras"
            min={1}
            max={6}
            step={1}
            value={muestras}
            onChange={handleMuestrasChange}
            placeholder="Ingrese la cantidad de muestras"
          />

          {[...Array(Number(muestras))].map((_, index) => (
            <div key={index}>
              <h3>Muestra {index + 1}</h3>
              <div className="datos-muestras">
                <label htmlFor={`peso-${index}`}>Peso: </label>
                <input
                  type="text"
                  id={`peso-${index}`}
                  onChange={(e) => handlePesoChange(index, e.target.value)}
                  placeholder="Ingrese el peso"
                  defaultValue={pesos[index]}
                />
              </div>
              <div>
                <label htmlFor={`temperatura-${index}`}>Temperatura: </label>
                <input
                  type="text"
                  id={`temperatura-${index}`}
                  onChange={(e) =>
                    handleTemperaturaChange(index, e.target.value)
                  }
                  placeholder="Ingrese la temperatura"
                  defaultValue={temperaturas[index]}
                />
              </div>
            </div>
          ))}

          {muestras > 0 && (
            <div className="button-group">
              {showNotification && (
                <div className="notificacion">¡Información guardada!</div>
              )}
              <button type="button" onClick={saveInfo}>
                Guardar
              </button>
            </div>
          )}

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
