/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useGuardar } from "../../../hooks/useGuardar";
import { PROVIDER_MAP, MARCA } from "../../../constants";
import { useState } from "react";
import SelectorMarca from "./SelectorMarca";
import { decimalComma, decimalPeriod } from "../../../utils/FormatDecimal";
import { formatNumber } from "../../../utils/FormatNumber";

const DatosG3 = ({ proveedor, cargaActual, cargas, setCargas }) => {
  const guardar = useGuardar(setCargas);
  const currentCarga = cargas[PROVIDER_MAP[proveedor]]?.[cargaActual - 1] || {};
  const [chickenBrand, setChickenBrand] = useState(
    currentCarga?.chickenBrand || MARCA[0].nombre
  );

  const getCnd = (brandName) => {
    const brand = Object.values(MARCA).find(
      (brand) => brand.nombre === brandName
    );
    return brand ? brand.CND : null;
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
    <form onSubmit={handleSubmit}>
      <h3>Control de Calidad</h3>
      <SelectorMarca
        chickenBrand={chickenBrand}
        onChange={handleChickenBrandChange}
      />
      <br />
      <br />
      <label htmlFor="pp">Peso promedio: </label>
      <input
        type="text"
        id="pp"
        defaultValue={currentCarga?.p_promedio || ""}
      />
      <br />
      <label htmlFor="tp">Temperatura promedio: </label>
      <input
        type="text"
        id="tp"
        defaultValue={currentCarga?.t_promedio || ""}
      />
      <br />
      <br />
      <h3>Control de Peso</h3>
      <label htmlFor="pg">Peso según guía: </label>
      <input type="text" id="pg" defaultValue={currentCarga?.p_guia || ""} />
      <br />
      <label htmlFor="pv">Peso verificado: </label>
      <input
        type="text"
        id="pv"
        defaultValue={currentCarga?.p_verificado || ""}
      />
      <br />
      <br />

      <Link to={"/datosg2"}>
        <button>Atras</button>
      </Link>
      <input type="submit" value="Continuar" />
    </form>
  );
};

export default DatosG3;
