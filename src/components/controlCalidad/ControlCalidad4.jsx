/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import {
  PROVIDER_MAP,
  RUBRO,
  GALPON,
  PERMISO_SANITARIO,
} from "../../constants/constants";
import BotonCopiar from "../BotonCopiar";
import LoadingSpinner from "../LoadingSpinner";

const ControlCalidad4 = ({
  cargas,
  proveedor,
  cargaActual,
  setCargaActual,
}) => {
  const navigate = useNavigate();
  const mapeo = PROVIDER_MAP[proveedor];
  const infoCarga = cargas[mapeo]?.[cargaActual - 1] || {};

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
      {!infoCarga ? (
        <LoadingSpinner />
      ) : (
        <div className="menu">
          <h2>Control de calidad</h2>
          <div className="section">
            <p>
              Rubro: <span className="value">{RUBRO}</span>
            </p>
            <p>
              Marca: <span className="value">{infoCarga.marca_rubro}</span>
            </p>
            <p>
              Lote: <span className="value">{infoCarga.lote || "N/A"}</span>
            </p>
            <p>
              Temperatura promedio:{" "}
              <span className="value">{infoCarga.t_promedio} ºC</span>
            </p>
            <p>
              Peso promedio:{" "}
              <span className="value">{infoCarga.p_promedio} Kg</span>
            </p>
          </div>
          <h2>Formatos</h2>
          <BotonCopiar text1={genTextCC()} text2={"Control de calidad"} />
          <BotonCopiar text1={genTextTyP()} text2={"Temperatura y peso"} />
          <BotonCopiar
            text1={genTextMuestras()}
            text2={"Muestras verificadas"}
          />
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
      )}
    </div>
  );
};

export default ControlCalidad4;
