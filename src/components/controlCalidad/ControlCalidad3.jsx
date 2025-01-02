import { useState } from "react";
/* eslint-disable react/prop-types */
import { PROVIDER_MAP, MARCA } from "../../constants/constants";
import { useNavigate } from "react-router-dom";
import { useGuardar } from "../../hooks/useGuardar";
import { useAuth } from "../login/AuthContext";
import { useAlert } from "../alert/AlertContext";
import SelectorMarca from "../guias/controles/SelectorMarca";
import EditableField from "../EditableField";
import { decimalComma, decimalPeriod } from "../../utils/FormatDecimal";
import "../../styles/ControlCalidad/ControlCalidad3.css";

const ControlCalidad3 = ({ cargas, setCargas, proveedor, cargaActual }) => {
  const mapeo = PROVIDER_MAP[proveedor];
  const infoCarga = cargas[mapeo]?.[cargaActual - 1] || {};
  const navigate = useNavigate();
  const [muestras, setMuestras] = useState(infoCarga.muestras || 0);
  const [temperaturas, setTemperaturas] = useState(
    infoCarga.temperaturas || []
  );
  const [pesos, setPesos] = useState(infoCarga.pesos || []);
  const guardar = useGuardar(setCargas);
  const [chickenBrand, setChickenBrand] = useState(
    infoCarga?.marca_rubro || MARCA[0].nombre
  );
  const { currentUser } = useAuth();
  const [onEdit, setOnEdit] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { addAlert } = useAlert();

  const promedio = (valores) => {
    if (!valores || valores.length === 0) return 0;
    const sum = valores.reduce((acc, temp) => acc + temp, 0);
    return sum / valores.length;
  };

  const t_promedio = temperaturas.length ? promedio(temperaturas) : null;
  const p_promedio = pesos.length ? promedio(pesos).toFixed(2) : null;

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
    newTemperaturas[index] = value;
    setTemperaturas(newTemperaturas);
  };

  const handlePesoChange = (index, value) => {
    const newPesos = [...pesos];
    newPesos[index] = value;
    setPesos(newPesos);
  };

  const handleChickenBrandChange = (e) => {
    const inputValue = e.target.value;
    setChickenBrand(inputValue);
    saveData("marca_rubro", inputValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onEdit !== null) {
      addAlert(
        "Debes terminar de editar el campo antes de continuar",
        "warning"
      );
      return;
    }

    const newData = {
      muestras: Number(muestras),
      temperaturas: temperaturas.map(Number),
      pesos: pesos.map(Number),
      t_promedio: parseFloat(decimalPeriod(t_promedio)),
      p_promedio: decimalComma(p_promedio),
    };
    guardar(proveedor, cargaActual, "/cc4", newData);
  };

  const saveData = (fieldName, newValue) => {
    const newData = {
      [fieldName]: newValue,
      editHistory: {
        ...infoCarga?.editHistory,
        [fieldName]: {
          value: newValue,
          editedBy: currentUser.name,
          editedAt: new Date().toISOString(),
        },
      },
    };
    guardar(proveedor, cargaActual, "", newData);
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
          {formatEditHistory(infoCarga.editHistory, "marca_rubro")}

          {/* Lote */}
          <EditableField
            fieldName="lote"
            label="Número de lote"
            value={infoCarga.lote}
            placeholder="Escribe el número de lote"
            onSave={saveData}
            currentUser={currentUser}
            editHistory={infoCarga.editHistory}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
          />

          {/* Muestras */}
          <label htmlFor="muestras">Cantidad de muestras: </label>
          <input
            type="number"
            id="muestras"
            min={0}
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
                  type="number"
                  id={`peso-${index}`}
                  value={pesos[index]}
                  onChange={(e) => handlePesoChange(index, e.target.value)}
                  placeholder="Ingrese el peso"
                />
              </div>
              <div>
                <label htmlFor={`temperatura-${index}`}>Temperatura: </label>
                <input
                  type="number"
                  id={`temperatura-${index}`}
                  value={temperaturas[index]}
                  onChange={(e) =>
                    handleTemperaturaChange(index, e.target.value)
                  }
                  placeholder="Ingrese la temperatura"
                />
              </div>
            </div>
          ))}

          <div className="button-group">
            <button onClick={() => navigate("/cc2")}>Volver</button>
            <button type="submit">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ControlCalidad3;
