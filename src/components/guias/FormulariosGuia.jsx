import BotonCopiar from "../BotonCopiar";
import { useNavigate } from "react-router-dom";
import { RUBRO, LOTE } from "../../constants/constants";
import "../../styles/guias/formulariosGuia.css";
import { formatNumber } from "../../utils/FormatNumber";
import LoadingSpinner from "../LoadingSpinner";
import { useEstados } from "../../contexts/EstadosContext";
import {
  getDestinoForGuia,
  getDestinosUnicosParaSaliendoPlanta,
} from "../../utils/destinoPorGuia";
import {
  formatCargaGuiaNumber,
  formatCargaNumber,
} from "../../utils/formatCargaNumber";

const FormulariosGuia = () => {
  const { cargaActual, setCargaActual, proveedor, currentCarga, plantaConfig } = useEstados();
  const GALPON = plantaConfig?.GALPON ?? "";
  const PERMISO_SANITARIO = plantaConfig?.PERMISO_SANITARIO ?? "";

  const navigate = useNavigate();

  // Always define infoCarga and numGuias, even if cargas is not loaded yet
  const numGuias = currentCarga?.codigos_guias?.length || 1;

  // Guard: show loading spinner if cargas is not loaded yet or still loading
  if (!currentCarga || !currentCarga.id) {
    return <LoadingSpinner />;
  }

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  const cargaNumber = currentCarga.cargaNumber;
  const formattedCargaNumber = formatCargaNumber(cargaNumber);

  const generateGuiaText1 = (index) => {
    const choosePeso = () => {
      if (numGuias > 1) return currentCarga?.pesos_guias[index];
      else return currentCarga?.p_total;
    };

    const parseLocalizedNumber = (stringNumber) => {
      // Remove thousands separators and replace decimal comma with period
      const normalizedNumber = stringNumber
        .replace(/\./g, "")
        .replace(",", ".");
      return Number(normalizedNumber);
    };

    const choosePesoVerificado = () => {
      if (numGuias === 1) {
        return currentCarga.p_verificado;
      }

      if (numGuias > 1) {
        if (index < numGuias - 1) {
          // Not the last guide
          return currentCarga.pesos_guias[index];
        } else {
          // Last guide
          const sumPreviousWeights = currentCarga.pesos_guias
            .slice(0, -1)
            .reduce((sum, weight) => sum + parseLocalizedNumber(weight), 0);
          const totalVerified = parseLocalizedNumber(currentCarga.p_verificado);
          const remainingWeight = totalVerified - sumPreviousWeights;
          return formatNumber(remainingWeight);
        }
      }
      return 0; // Default return if none of the conditions are met
    };

    return (
      "**DATOS DE LA GUIA** 🧾\n" +
      `**Carga Nº ${formatCargaGuiaNumber(cargaNumber, index, numGuias)}**:\n` +
      `**Empresa:** ${proveedor}\n` +
      `**Galpón:** ${GALPON}\n` +
      `**Rubro:** ${RUBRO}\n` +
      `**Monto según Guía:** ${choosePeso()} kg\n` +
      `**Monto verificado:** ${choosePesoVerificado()} kg\n` +
      `**Número de Guía:** ${currentCarga?.codigos_guias[index]}\n` +
      `**Marca:** ${currentCarga?.marca_rubro}\n` +
      `**Números de lotes:** ${currentCarga.lote}\n` +
      `**Fecha de Elaboración:** ${LOTE.elaboracion}\n` +
      `**Fecha de Vencimiento:** ${LOTE.vencimiento}\n` +
      `**Peso Promedio:** ${currentCarga.p_promedio} kg\n` +
      `**Temperatura Promedio:** ${currentCarga.t_promedio} ºC\n` +
      `**CND o CPE:** ${currentCarga.cnd}\n` +
      `**Permiso Sanitario:** ${PERMISO_SANITARIO}\n` +
      `**Estado destino:** ${getDestinoForGuia(currentCarga, index).estadoDestino}\n` +
      `**Entidad destino:** ${getDestinoForGuia(currentCarga, index).destino}\n` +
      `**🆔 del Despacho:** ${currentCarga.id_despacho}`
    );
  };

  const generateGuiaText2 = (index) => {
    if (numGuias === 1) return "Datos de la guía";
    else return `Datos de la guía ${cargaNumber}.${index + 1}`;
  };

  const generateActaText2 = (index) => {
    if (numGuias === 1) return "Acta de responsabilidad";
    else return `Acta de responsabilidad ${cargaNumber}.${index + 1}`;
  };

  const checkTk = () => {
    if (currentCarga.tk === "Si") return "Sí";
    else return "No";
  };

  const generateDatosVehiculo = () => {
    return (
      "**DATOS DEL VEHÍCULO** 🚚\n" +
      `**Carga Nº ${formattedCargaNumber}:**\n` +
      `**Empresa:** ${proveedor}\n` +
      `**Galpón:** ${GALPON}\n` +
      `**Rubro:** ${RUBRO}\n` +
      `**Número de Guía:** ${currentCarga?.codigos_guias.join("/")}\n` +
      `**Thermo King Operativo:** ${checkTk()}\n` +
      `**Transporte:** ${currentCarga.transporte}\n` +
      `**Nombre del chofer:** ${currentCarga.choferNombre || currentCarga.chofer || "—"}\n` +
      `**Cédula de identidad del chofer:** ${currentCarga.cedula || "—"}\n` +
      `**Placa del vehículo:** ${currentCarga.placa}\n` +
      `**Número de precintos:** ${
        Array.isArray(currentCarga.precintos) &&
        currentCarga.precintos.length > 0
          ? currentCarga.precintos.join(", ")
          : "S/P"
      }\n` +
      `**Marca del vehículo:** ${currentCarga.marcaVehiculo}\n` +
      `**🆔 de la unidad:** ${currentCarga.id_unidad}`
    );
  };

  const generateActaResponsabilidad = (index) => {
    return (
      "**ACTA DE RESPONSABILIDAD**\n" +
      `**CARGA Nº ${formatCargaGuiaNumber(cargaNumber, index, numGuias)}**\n` +
      `**Proveedor:** ${proveedor}\n` +
      `**Galpón:** ${GALPON}\n` +
      `**Rubro:** ${RUBRO}\n` +
      `**Guía Sada Nro:** ${currentCarga?.codigos_guias[index]}\n` +
      `**Fecha:** ${currentCarga.fecha}`
    );
  };

  const generateSaliendoPlanta = () => {
    const destinosUnicos = getDestinosUnicosParaSaliendoPlanta(
      currentCarga,
      numGuias
    );
    const destinoTexto =
      destinosUnicos.length > 0 ? destinosUnicos.join(" / ") : "";
    return (
      "**SALIENDO DE PLANTA**\n" +
      `**CARGA Nº ${formattedCargaNumber}**\n` +
      `**Empresa:** ${proveedor}\n` +
      `**Galpón:** ${GALPON}\n` +
      `**Producto:** ${RUBRO}\n` +
      `**Fecha:** ${currentCarga.fecha}\n` +
      `**Destino:** ${destinoTexto}\n`
    );
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h4>Selecciona el formato a copiar:</h4>
        {[...Array(numGuias)].map((_, index) => (
          <BotonCopiar
            key={index}
            text1={generateGuiaText1(index)}
            text2={generateGuiaText2(index)}
          />
        ))}
        <BotonCopiar
          text1={generateDatosVehiculo()}
          text2="Datos del vehículo"
        />
        {[...Array(numGuias)].map((_, index) => (
          <BotonCopiar
            key={index}
            text1={generateActaResponsabilidad(index)}
            text2={generateActaText2(index)}
          />
        ))}
        <BotonCopiar
          text1={generateSaliendoPlanta()}
          text2="Saliendo de planta"
        />

        <div className="button-group">
          <button onClick={() => navigate("/revisionguias")}>Volver</button>
          <button
            onClick={() => {
              setCargaActual(0);
              navigate("/carga");
            }}
          >
            Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormulariosGuia;
