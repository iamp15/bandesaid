import { getDestinoForGuia } from "./destinoPorGuia";
import { decimalPeriod } from "./FormatDecimal";

/**
 * Comprueba que la carga tenga todos los datos necesarios para generar anclajes.
 * Misma validación usada en Verificación de datos (RevisionGuias) antes de ir a formulariosguia.
 * @param {Object} currentCarga - Datos de la carga actual
 * @returns {{ valid: boolean, missingFields: string[] }}
 */
export const validarDatosParaAnclajes = (currentCarga) => {
  const missingFields = [];

  if (!currentCarga?.chofer) missingFields.push("Nombre del chofer");
  if (!currentCarga?.cedula) missingFields.push("Cédula");
  if (!currentCarga?.marcaVehiculo) missingFields.push("Marca vehículo");
  if (!currentCarga?.placa) missingFields.push("Placa");
  if (!currentCarga?.id_unidad) missingFields.push("ID de unidad");
  const numGuias = Math.max(1, currentCarga?.codigos_guias?.length || 0);
  for (let i = 0; i < numGuias; i++) {
    const d = getDestinoForGuia(currentCarga, i);
    if (!d.destino || String(d.destino).trim() === "") {
      missingFields.push(numGuias > 1 ? `Entidad destino (guía ${i + 1})` : "Entidad destino");
    }
    if (!d.estadoDestino || String(d.estadoDestino).trim() === "") {
      missingFields.push(numGuias > 1 ? `Estado destino (guía ${i + 1})` : "Estado destino");
    }
    if (!d.codigo_espejo || String(d.codigo_espejo).trim() === "") {
      missingFields.push(numGuias > 1 ? `Código espejo (guía ${i + 1})` : "Código espejo");
    }
  }
  if (!currentCarga?.transporte || String(currentCarga.transporte).trim() === "") {
    missingFields.push("Transporte");
  }
  if (!currentCarga?.marca_rubro) missingFields.push("Marca");
  if (!currentCarga?.lote) missingFields.push("Lote");
  if (!currentCarga?.p_promedio) missingFields.push("Peso promedio");
  if (!currentCarga?.t_promedio) missingFields.push("Temperatura promedio");
  if (!currentCarga?.p_total) missingFields.push("Peso total de la carga");
  if (!currentCarga?.p_verificado) missingFields.push("Peso verificado");
  if (
    !Array.isArray(currentCarga?.codigos_guias) ||
    currentCarga.codigos_guias.length === 0 ||
    !currentCarga.codigos_guias[0]
  ) {
    missingFields.push("Código(s) de guía");
  }
  // Precintos vacíos o ["S/P"] es válido (carga sin precintos)
  if (!Array.isArray(currentCarga?.precintos)) {
    missingFields.push("Precintos");
  }
  if (!currentCarga?.id_despacho) missingFields.push("ID del despacho");

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Convierte una cadena numérica con formato local (miles con punto, decimal con coma)
 * a número. Retorna 0 si no puede interpretarse.
 */
const parsePesoLocalizado = (pesoStr) => {
  if (!pesoStr) return 0;
  const parts = String(pesoStr).split(",");
  if (parts.length > 1) {
    const integerPart = parts.slice(0, -1).join("").replace(/\./g, "");
    const decimalPart = parts[parts.length - 1];
    const finalValue = parseFloat(`${integerPart}.${decimalPart}`);
    return isNaN(finalValue) ? 0 : finalValue;
  }
  const finalValue = parseFloat(
    String(pesoStr).replace(/\./g, "").replace(",", ".")
  );
  return isNaN(finalValue) ? 0 : finalValue;
};

/**
 * Normaliza el peso promedio para poder compararlo numéricamente.
 */
const pesoPromedioNumerico = (value) => {
  let v = value;
  if (v && v.includes(",")) {
    v = v.replace(",", ".");
  }
  const formattedValue = decimalPeriod(v);
  return parseFloat(formattedValue).toFixed(1);
};

/**
 * Valida restricciones de negocio sobre los datos de la carga.
 * Retorna el mensaje de error de la primera validación que falle, o null si todo está correcto.
 */
export const validarRestriccionesCarga = (currentCarga) => {
  if (currentCarga?.t_promedio > 0) {
    return "Alerta: la temperatura promedio debería ser negativa.";
  }

  if (pesoPromedioNumerico(currentCarga?.p_promedio) < 0) {
    return "Alerta: el peso promedio debe ser positivo.";
  }

  const numGuias = currentCarga?.codigos_guias?.length || 0;
  if (numGuias > 0) {
    const pesosGuias = currentCarga?.pesos_guias || [];
    const sumPesos =
      pesosGuias.reduce((acc, peso) => acc + parsePesoLocalizado(peso), 0) || 0;
    const pesoTotal = parsePesoLocalizado(currentCarga?.p_total) || 0;

    if (Math.abs(sumPesos - pesoTotal) > 0.001) {
      return `La suma de los pesos de las guías (${sumPesos}) debe ser igual al peso total de la carga (${pesoTotal}).`;
    }
  }

  return null;
};
