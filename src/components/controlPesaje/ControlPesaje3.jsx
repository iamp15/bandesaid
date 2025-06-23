import { Link } from "react-router-dom";
import BotonCopiar from "../BotonCopiar";
import { GALPON, RUBRO } from "../../constants/constants";
import "../../styles/pesaje/ControlPesaje3.css";
import { useNavigate } from "react-router-dom";
import { useEstados } from "../../contexts/EstadosContext";
import LoadingSpinner from "../LoadingSpinner";

const ControlPesaje3 = () => {
  const { setCargaActual, cargaActual, proveedor, currentCarga } = useEstados();
  const navigate = useNavigate();

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  if (!currentCarga || !currentCarga.id) return <LoadingSpinner />;

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
      `*Fecha:* ${currentCarga.fecha}\n` +
      `\n✓ Peso verificado *${currentCarga.p_verificado} kg*`
    );
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Formato peso verificado:</h2>
        <div className="pesos">
          <p>
            Petotal de la carga:{" "}
            <span className="negrita">{currentCarga.p_total} kg</span>
          </p>
          <p>
            Peso verificado:{" "}
            <span className="negrita">{currentCarga.p_verificado} kg</span>
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
