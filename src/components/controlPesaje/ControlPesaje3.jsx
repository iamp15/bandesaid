/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import BotonCopiar from "../BotonCopiar";
import { PROVIDER_MAP } from "../../constants/constants";
import { GALPON, RUBRO } from "../../constants/constants";
import "../../styles/pesaje/ControlPesaje3.css";
import { useNavigate } from "react-router-dom";
import { useEstados } from "../../contexts/EstadosContext";

const ControlPesaje3 = () => {
  const { cargas, setCargaActual, cargaActual, proveedor } = useEstados();
  const mapeo = PROVIDER_MAP[proveedor];
  const infoCarga = cargas[mapeo]?.[cargaActual - 1] || {};
  const navigate = useNavigate();

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

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
        <div className="pesos">
          <p>
            Petotal de la carga:{" "}
            <span className="negrita">{infoCarga.p_total} kg</span>
          </p>
          <p>
            Peso verificado:{" "}
            <span className="negrita">{infoCarga.p_verificado} kg</span>
          </p>
        </div>
        <BotonCopiar text1={pVerificadoText()} text2={"Copiar formato"} />
        <div className="button-group">
          <Link to={"/pesaje2"}>
            <button>Atras</button>
          </Link>
          <Link to={"/proveedor"}>
            <button onClick={() => setCargaActual(0)}>Inicio</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ControlPesaje3;
