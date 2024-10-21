/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import BotonCopiar from "../BotonCopiar";
import { PROVIDER_MAP } from "../../constants";
import { GALPON, RUBRO } from "../../constants";

const ControlPesaje3 = ({ cargas, proveedor, cargaActual, setCargaActual }) => {
  const mapeo = PROVIDER_MAP[proveedor];
  const infoCarga = cargas[mapeo]?.[cargaActual - 1];

  const pVerificadoText = () => {
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
      `*Fecha:* ${infoCarga.fecha}\n` +
      `\n✓ Peso verificado *${infoCarga.p_verificado} kg*`
    );
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Formato peso verificado:</h2>
        <BotonCopiar text1={pVerificadoText()} text2={"Peso verificado"} />
        <div className="button-group">
          <Link to={"/pesaje2"}>
            <button>Atras</button>
          </Link>
          <Link to={"/carga"}>
            <button onClick={() => setCargaActual(0)}>Inicio</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ControlPesaje3;
