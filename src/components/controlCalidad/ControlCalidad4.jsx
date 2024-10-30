/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import {
  PROVIDER_MAP,
  RUBRO,
  GALPON,
  PERMISO_SANITARIO,
  MARCA,
} from "../../constants";
import { useEffect } from "react";
import { useGuardar } from "../../hooks/useGuardar";
import { decimalComma, decimalPeriod } from "../../utils/FormatDecimal";
import BotonCopiar from "../BotonCopiar";

const ControlCalidad4 = ({
  cargas,
  setCargas,
  proveedor,
  cargaActual,
  setCargaActual,
}) => {
  const navigate = useNavigate();
  const mapeo = PROVIDER_MAP[proveedor];
  const infoCarga = cargas[mapeo]?.[cargaActual - 1];
  const guardar = useGuardar(setCargas);

  const promedio = (valores) => {
    const sum = valores.reduce((acc, temp) => acc + temp, 0);
    return sum / valores.length;
  };

  const getCnd = (brandName) => {
    const brand = Object.values(MARCA).find(
      (brand) => brand.nombre === brandName
    );
    return brand ? brand.CND : null;
  };

  const t_promedio = promedio(infoCarga.temperaturas);
  const p_promedio = promedio(infoCarga.pesos).toFixed(2);

  useEffect(() => {
    const newData = {
      t_promedio: parseFloat(decimalPeriod(t_promedio)).toFixed(1),
      p_promedio: decimalComma(p_promedio),
      cnd: getCnd(infoCarga.marca_rubro),
    };
    guardar(proveedor, cargaActual, "", newData);
  }, []);

  const numeracion = () => {
    if (cargaActual < 10) {
      return "0" + cargaActual;
    } else {
      return cargaActual;
    }
  };

  const genTextCC = () => {
    return (
      `*CARGA Nº ${numeracion()}*\n` +
      `*Proveedor:* ${proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Rubro:* ${RUBRO}\n` +
      `*Fecha:* ${infoCarga.fecha}\n` +
      "\n✓ Control de Calidad"
    );
  };

  const genTextTyP = () => {
    return (
      `*CARGA Nº ${numeracion()}*\n` +
      `*Proveedor:* ${proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Rubro:* ${RUBRO}\n` +
      `*Fecha:* ${infoCarga.fecha}\n` +
      "\n✓ *Fecha Elaboración:* N/A\n" +
      "✓ *Fecha Vencimiento:* N/A\n" +
      `✓ *Nº Lote:* ${infoCarga.lote || "N/A"}\n` +
      `✓ *Peso promedio:* ${infoCarga.p_promedio} kg\n` +
      `✓ *Temperatura promedio:* ${infoCarga.t_promedio} ºC\n` +
      `✓ *Permiso sanitario:* ${PERMISO_SANITARIO}\n` +
      `✓ *CND o CPE:* ${infoCarga.cnd}`
    );
  };

  const genTextMuestras = () => {
    return (
      `*CARGA Nº ${numeracion()}*\n` +
      `*Proveedor:* ${proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Rubro:* ${RUBRO}\n` +
      `*Fecha:* ${infoCarga.fecha}\n` +
      "\n✓ Muestras verificadas"
    );
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Control de calidad</h2>
        <div className="section">
          <p>Rubro: {RUBRO}</p>
          <p>Marca: {infoCarga.marca_rubro}</p>
          <p>Lote: {infoCarga.lote || "N/A"}</p>
          <p>
            Temperatura promedio:{" "}
            {parseFloat(decimalPeriod(t_promedio)).toFixed(1)} ºC
          </p>
          <p>Peso promedio: {decimalComma(p_promedio)} kg</p>
        </div>
        <h2>Formatos</h2>
        <BotonCopiar text1={genTextCC()} text2={"Control de calidad"} />
        <BotonCopiar text1={genTextTyP()} text2={"Temperatura y peso"} />
        <BotonCopiar text1={genTextMuestras()} text2={"Muestras verificadas"} />
        <div className="button-group">
          <button type="button" onClick={() => navigate("/cc3")}>
            Volver
          </button>
          <button
            type="button"
            onClick={() => {
              navigate("/carga");
              setCargaActual(0);
            }}
          >
            Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlCalidad4;
