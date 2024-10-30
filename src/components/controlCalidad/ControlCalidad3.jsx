import { useState } from "react";
/* eslint-disable react/prop-types */
import { PROVIDER_MAP, MARCA } from "../../constants";
import { useNavigate } from "react-router-dom";
import { useGuardar } from "../../hooks/useGuardar";
import SelectorMarca from "../guias/controles/SelectorMarca";
import "../../styles/ControlCalidad/ControlCalidad3.css";

const ControlCalidad3 = ({ cargas, setCargas, proveedor, cargaActual }) => {
  const mapeo = PROVIDER_MAP[proveedor];
  const infoCarga = cargas[mapeo]?.[cargaActual - 1];
  const navigate = useNavigate();
  const [muestras, setMuestras] = useState(infoCarga.muestras || "");
  const [temperaturas, setTemperaturas] = useState(
    infoCarga.temperaturas || []
  );
  const [pesos, setPesos] = useState(infoCarga.pesos || []);
  const guardar = useGuardar(setCargas);
  const [chickenBrand, setChickenBrand] = useState(
    infoCarga?.marca_rubro || MARCA[0].nombre
  );
  const [lote, setLote] = useState(infoCarga.lote || "N/A");

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
    setChickenBrand(e.target.value);
  };

  const handleLoteChange = (e) => {
    setLote(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newData = {
      marca_rubro: chickenBrand,
      lote: lote,
      muestras: Number(muestras),
      temperaturas: temperaturas.map(Number),
      pesos: pesos.map(Number),
    };
    guardar(proveedor, cargaActual, "/cc4", newData);
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          <h2>Control de calidad</h2>

          <SelectorMarca
            chickenBrand={chickenBrand}
            onChange={handleChickenBrandChange}
          />

          <label htmlFor="lote">Número de lote: </label>
          <input
            type="text"
            id="lote"
            value={lote}
            onChange={handleLoteChange}
            placeholder="Escribe el número de lote "
          />

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
