import { useEffect, useState } from "react";
/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import NumGuias from "./NumGuias";
import NumPrecintos from "./NumPrecintos";
import { useGuardar } from "../../hooks/useGuardar";
import { PROVIDER_MAP } from "../../constants";

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

  useEffect(() => {
    const initialCodigos =
      cargas[mapeo]?.[cargaActual - 1]?.codigos_guias || [];
    const initialPrecintos = cargas[mapeo]?.[cargaActual - 1]?.precintos || [];
    setCodigos(initialCodigos);
    setPrecintos(initialPrecintos);
    setGuias_precintos((prev) => ({
      ...prev,
      guias: initialCodigos.length,
      precintos: initialPrecintos.length,
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
    const newGuiasValue = Number(e.target.value);
    setGuias_precintos((prev) => ({ ...prev, guias: newGuiasValue }));

    setCodigos((prev) => {
      const newCodigos = [...prev];
      if (newGuiasValue > prev.length) {
        for (let i = prev.length; i < newGuiasValue; i++) {
          newCodigos.push("");
        }
      } else if (newGuiasValue < prev.length) {
        newCodigos.splice(newGuiasValue);
      }
      return newCodigos;
    });
  };

  const handlePrecintosChange = (e) => {
    const newPrecintosValue = Number(e.target.value);
    setGuias_precintos((prev) => ({ ...prev, precintos: newPrecintosValue }));
    setPrecintos((prev) => {
      const newPrecintos = [...prev];
      if (newPrecintosValue > prev.length) {
        for (let i = prev.length; i < newPrecintosValue; i++) {
          newPrecintos.push("");
        }
      } else if (newPrecintosValue < prev.length) {
        newPrecintos.splice(newPrecintosValue);
      }
      return newPrecintos;
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Datos Guía</h3>
      <label htmlFor="n_guias">Cantidad de guías: </label>
      <input
        type="number"
        id="n_guias"
        min={0}
        max={100}
        value={guias_precintos.guias}
        onChange={handleGuiasChange}
      />
      <br />
      <NumGuias
        num={guias_precintos.guias}
        setCodigos={setCodigos}
        cargas={cargas}
        mapeo={mapeo}
        cargaActual={cargaActual}
      />
      <br />
      <h3>Datos Precintos</h3>
      <label htmlFor="n_precintos">Cantidad de precintos: </label>
      <input
        type="number"
        id="n_precintos"
        min={0}
        max={100}
        value={guias_precintos.precintos}
        onChange={handlePrecintosChange}
      />
      <br />
      <NumPrecintos
        num={guias_precintos.precintos}
        setPrecintos={setPrecintos}
        cargas={cargas}
        mapeo={mapeo}
        cargaActual={cargaActual}
      />
      <br />
      <br />
      <Link to={"/datosg3"}>
        <button type="button">Atras</button>
      </Link>
      <button type="submit">Continuar</button>
    </form>
  );
};

export default DatosG4;
