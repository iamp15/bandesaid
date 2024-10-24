/* eslint-disable react/prop-types */
import BotonCopiar from "../BotonCopiar";
import { useGuardar } from "../../hooks/useGuardar";
import { PROVIDER_MAP, GALPON, RUBRO } from "../../constants";
import { formatNumber } from "../../utils/FormatNumber";
import { Link } from "react-router-dom";
import "../../styles/pesaje/ControlPesaje2.css";

const ControlPesaje2 = ({ cargas, setCargas, proveedor, cargaActual }) => {
  const key = PROVIDER_MAP[proveedor];
  const currentCarga = cargas[key]?.[cargaActual - 1] || {};
  const guardar = useGuardar(setCargas);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newValue = e.target.pVerificado.value;
    const peso = formatNumber(newValue);
    const updatedCarga = { p_verificado: peso };
    guardar(proveedor, cargaActual, "/pesaje3", updatedCarga);
  };

  const inicioCargaText = () => {
    const numeracion = () => {
      if (cargaActual < 10) {
        return "0" + cargaActual;
      } else {
        return cargaActual;
      }
    };
    return (
      "*INICIO DE CARGA  👀*\n" +
      `*CARGA Nº ${numeracion()}*\n` +
      `*Proveedor:* ${proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Rubro:* ${RUBRO}\n` +
      `*Thermo King:* ${currentCarga.tk}\n` +
      `*Fecha:* ${currentCarga.fecha}\n`
    );
  };

  const cargaFinalizadaText = () => {
    const numeracion = () => {
      if (cargaActual < 10) {
        return "0" + cargaActual;
      } else {
        return cargaActual;
      }
    };
    return (
      `*CARGA Nº ${numeracion()}*\n` +
      `*Proveedor:* ${proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Rubro:* ${RUBRO}\n` +
      `*Fecha:* ${currentCarga.fecha}\n` +
      "\n✓ Carga finalizada."
    );
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          <h2>Formatos iniciales:</h2>
          <div className="copy-buttons">
            <BotonCopiar text1={inicioCargaText()} text2="Inicio de carga" />
            <BotonCopiar
              text1={cargaFinalizadaText()}
              text2="Carga finalizada"
            />
          </div>

          <h2>Pesaje:</h2>
          <label htmlFor="pVerificado">Peso verificado:</label>
          <input
            type="text"
            id="pVerificado"
            defaultValue={currentCarga?.p_verificado || ""}
            required
          />
          <div className="button-group">
            <Link to={"/pesaje1"}>
              <button>Atras</button>
            </Link>
            <button type="submit">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ControlPesaje2;
