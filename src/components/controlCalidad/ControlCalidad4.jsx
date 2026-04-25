import { useNavigate } from "react-router-dom";
import { RUBRO } from "../../constants/constants";
import BotonCopiar from "../BotonCopiar";
import LoadingSpinner from "../LoadingSpinner";
import { useEstados } from "../../contexts/EstadosContext";
import { formatCargaNumber } from "../../utils/formatCargaNumber";

const ControlCalidad4 = () => {
  const { setCargaActual, cargaActual, proveedor, currentCarga, plantaConfig } = useEstados();
  const GALPON = plantaConfig?.GALPON ?? "";
  const PERMISO_SANITARIO = plantaConfig?.PERMISO_SANITARIO ?? "";
  const navigate = useNavigate();

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  if (!currentCarga || !currentCarga.id) return <LoadingSpinner />;

  const cargaNumber = formatCargaNumber(currentCarga.cargaNumber);

  const genTextCC = () => {
    return (
      "**CONTROL DE CALIDAD 1/1**\n" +
      `**CARGA Nº ${cargaNumber}**\n` +
      `**Proveedor:** ${proveedor}\n` +
      `**Galpón:** ${GALPON}\n` +
      `**Rubro:** ${RUBRO}\n` +
      `**Fecha:** ${currentCarga.fecha}\n`
    );
  };

  const genTextTyP = () => {
    return (
      "**RESULTADOS DE MUESTRAS VERIFICADAS**\n" +
      `**CARGA Nº ${cargaNumber}**\n` +
      `**Proveedor:** ${proveedor}\n` +
      `**Galpón:** ${GALPON}\n` +
      `**Rubro:** ${RUBRO}\n` +
      `**Fecha:** ${currentCarga.fecha}\n` +
      `\n**✓ Marca del rubro:** ${currentCarga.marca_rubro}\n` +
      "✓ **Fecha Elaboración:** N/A\n" +
      "✓ **Fecha Vencimiento:** N/A\n" +
      `✓ **Nº Lote:** ${currentCarga.lote || "N/A"}\n` +
      `✓ **Peso promedio:** ${currentCarga.p_promedio} kg\n` +
      `✓ **Temperatura promedio:** ${currentCarga.t_promedio} ºC\n` +
      `✓ **Permiso sanitario:** ${PERMISO_SANITARIO}\n` +
      `✓ **CND o CPE:** ${currentCarga.cnd}`
    );
  };

  const genTextMuestras = () => {
    return (
      "**MUESTRAS VERIFICADAS**\n" +
      `**CARGA Nº ${cargaNumber}**\n` +
      `**Proveedor:** ${proveedor}\n` +
      `**Galpón:** ${GALPON}\n` +
      `**Rubro:** ${RUBRO}\n` +
      `**Fecha:** ${currentCarga.fecha}\n`
    );
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Control de calidad</h2>
        <div className="section">
          <p>
            Rubro: <span className="value">{RUBRO}</span>
          </p>
          <p>
            Marca: <span className="value">{currentCarga.marca_rubro}</span>
          </p>
          <p>
            CND: <span className="value">{currentCarga.cnd}</span>
          </p>
          <p>
            Lote: <span className="value">{currentCarga.lote || "N/A"}</span>
          </p>
          <p>
            Peso promedio:{" "}
            <span className="value">{currentCarga.p_promedio} Kg</span>
          </p>
          <p>
            Temperatura promedio:{" "}
            <span className="value">{currentCarga.t_promedio} ºC</span>
          </p>
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
