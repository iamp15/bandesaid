/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useGuardar } from "../../../hooks/useGuardar";
import { PROVIDER_MAP, MARCA } from "../../../constants";
import { useState } from "react";
import SelectorMarca from "./SelectorMarca";
import { decimalComma, decimalPeriod } from "../../../utils/FormatDecimal";
import { formatNumber } from "../../../utils/FormatNumber";
import "../../../styles/guias/DatosG3.css";

const DatosG3 = ({ proveedor, cargaActual, cargas, setCargas }) => {
  const guardar = useGuardar(setCargas);
  const currentCarga = cargas[PROVIDER_MAP[proveedor]]?.[cargaActual - 1] || {};
  const [chickenBrand, setChickenBrand] = useState(
    currentCarga?.marca_rubro || MARCA[0].nombre
  );
  const [lote, setLote] = useState(currentCarga.lote || "N/A");
  const getCnd = (brandName) => {
    const brand = Object.values(MARCA).find(
      (brand) => brand.nombre === brandName
    );
    return brand ? brand.CND : null;
  };

  const handleLoteChange = (e) => {
    setLote(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const temperatura = decimalPeriod(e.target.tp.value);
    const tempRedondo = parseFloat(temperatura).toFixed(1);

    if (tempRedondo > 0) {
      alert("Alerta: la temperatura promedio debería ser negativa.");
      return;
    }

    const newData = {
      lote: lote,
      p_promedio: decimalComma(e.target.pp.value),
      t_promedio: tempRedondo,
      p_guia: formatNumber(e.target.pg.value),
      p_verificado: formatNumber(e.target.pv.value),
      marca_rubro: chickenBrand,
      cnd: getCnd(chickenBrand),
    };
    guardar(proveedor, cargaActual, "/datosG4", newData);
  };

  const handleChickenBrandChange = (e) => {
    setChickenBrand(e.target.value);
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          <h2>Control de Calidad</h2>
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
          <label htmlFor="pp">Peso promedio: </label>
          <input
            type="text"
            id="pp"
            defaultValue={currentCarga?.p_promedio || ""}
            placeholder="Peso promedio del/de los pollo(s)"
          />
          <label htmlFor="tp">Temperatura promedio: </label>
          <input
            type="text"
            id="tp"
            defaultValue={currentCarga?.t_promedio || ""}
            placeholder="Temperatura promedio del/de los pollo(s)"
          />
          <h2>Control de Peso</h2>
          <label htmlFor="pg">Peso total de la carga: </label>
          <input
            type="text"
            id="pg"
            defaultValue={currentCarga?.p_guia || ""}
            placeholder="Ej.: 10000"
          />
          <label htmlFor="pv">Peso verificado: </label>
          <input
            type="text"
            id="pv"
            defaultValue={currentCarga?.p_verificado || ""}
            placeholder="Ej.: 10000.5"
          />
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
