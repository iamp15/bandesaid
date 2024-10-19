import { useEffect, useState } from "react";
/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import NumGuias from "./NumGuias";
import NumPrecintos from "./NumPrecintos";
import { useGuardar } from "../../../hooks/useGuardar";
import { PROVIDER_MAP } from "../../../constants";
import { isValidNumber } from "../../../utils/CharLimit";
import "../../../styles/guias/DatosG4.css";

const DatosG4 = ({
  proveedor,
  cargaActual,
  cargas,
  setCargas,
  guias_precintos,
  setGuias_precintos,
}) => {
  const [codigos, setCodigos] = useState([]);
  const [precintos, setPrecintos] = useState([]);
  const guardar = useGuardar(setCargas);
  const mapeo = PROVIDER_MAP[proveedor];
  const numGuias =
    guias_precintos.guias === "" ? "" : Number(guias_precintos.guias);
  const numPrecintos =
    guias_precintos.precintos === "" ? "" : Number(guias_precintos.precintos);

  useEffect(() => {
    const initialCodigos =
      cargas[mapeo]?.[cargaActual - 1]?.codigos_guias || [];
    const initialPrecintos = cargas[mapeo]?.[cargaActual - 1]?.precintos || [];
    setCodigos(initialCodigos);
    setPrecintos(initialPrecintos);
    setGuias_precintos((prev) => ({
      ...prev,
      guias: initialCodigos.length || "",
      precintos: initialPrecintos.length || "",
    }));
  }, [cargas, cargaActual, mapeo, setGuias_precintos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newData = {
      codigos_guias: codigos,
      precintos: precintos,
    };

    guardar(proveedor, cargaActual, "/revisionguias", newData);
  };

  const handleGuiasChange = (e) => {
    const inputValue = e.target.value;
    const newGuiasValue =
      inputValue === "" ? "" : Math.min(Math.max(0, Number(inputValue)), 15);

    setGuias_precintos((prev) => ({ ...prev, guias: newGuiasValue }));

    setCodigos((prev) => {
      if (newGuiasValue === "") {
        return [];
      }
      const numGuias = Number(newGuiasValue);
      const newCodigos = [...prev];
      if (numGuias > prev.length) {
        for (let i = prev.length; i < numGuias; i++) {
          newCodigos.push("");
        }
      } else if (numGuias < prev.length) {
        newCodigos.splice(numGuias);
      }
      return newCodigos;
    });
  };

  const handleGuideNumberChange = (index, value) => {
    if (value === "" || isValidNumber(value, 9)) {
      setCodigos((prev) => {
        const newCodigos = [...prev];
        newCodigos[index] = value;
        return newCodigos;
      });
    }
  };

  const handlePrecintosChange = (e) => {
    const inputValue = e.target.value;
    const newPrecintosValue =
      inputValue === "" ? "" : Math.min(Math.max(0, Number(inputValue)), 15);

    setGuias_precintos((prev) => ({ ...prev, precintos: newPrecintosValue }));

    setPrecintos((prev) => {
      if (newPrecintosValue === "") {
        return [];
      }
      const numPrecintos = Number(newPrecintosValue);
      const newPrecintos = [...prev];
      if (numPrecintos > prev.length) {
        for (let i = prev.length; i < numPrecintos; i++) {
          newPrecintos.push("");
        }
      } else if (numPrecintos < prev.length) {
        newPrecintos.splice(numPrecintos);
      }
      return newPrecintos;
    });
  };

  const handlePrecintoNumberChange = (index, value) => {
    const sanitizedValue = value.replace(/\D/g, "");
    setPrecintos((prev) => {
      const newPrecintos = [...prev];
      newPrecintos[index] = sanitizedValue;
      return newPrecintos;
    });
  };

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
              value={numGuias}
              onChange={handleGuiasChange}
              placeholder="Ingrese la cantidad de guías"
            />
          </div>
          <NumGuias
            num={numGuias}
            cargas={cargas}
            mapeo={mapeo}
            cargaActual={cargaActual}
            onGuideNumberChange={handleGuideNumberChange}
          />
          <div className="number-input-container">
            <h2>Datos Precintos</h2>
            <label htmlFor="n_precintos">Cantidad de precintos: </label>
            <input
              type="number"
              id="n_precintos"
              min={0}
              max={15}
              step={1}
              value={numPrecintos}
              onChange={handlePrecintosChange}
              placeholder="Ingrese la cantidad de precintos"
            />
          </div>

          <NumPrecintos
            num={numPrecintos}
            cargas={cargas}
            mapeo={mapeo}
            cargaActual={cargaActual}
            onPrecintoNumberChange={handlePrecintoNumberChange}
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
