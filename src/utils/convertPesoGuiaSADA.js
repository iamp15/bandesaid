import { formatNumber } from "./FormatNumber";

/**
 * Convierte peso de TM (toneladas métricas) a Kg
 * @param {string} pesoEnTM - Peso en TM con formato guía SADA (coma decimal, 3 decimales, ej: "1,234")
 * @returns {number} - Peso en Kg
 */
export const convertPesoGuiaSADA = (pesoEnTM) => {
  if (!pesoEnTM || typeof pesoEnTM !== "string") {
    return 0;
  }

  // Remover espacios y convertir coma decimal a punto
  const cleaned = pesoEnTM.trim().replace(",", ".");
  const pesoNumero = parseFloat(cleaned);

  if (isNaN(pesoNumero)) {
    return 0;
  }

  // Convertir TM a Kg: 1 TM = 1000 Kg
  return pesoNumero * 1000;
};

/**
 * Formatea peso en Kg según formato de la aplicación
 * @param {number} pesoEnKg - Peso en Kg como número
 * @returns {string} - Peso formateado (punto miles, sin decimales, ej: "1.234")
 */
export const formatPesoAplicacion = (pesoEnKg) => {
  if (typeof pesoEnKg !== "number" || isNaN(pesoEnKg)) {
    return "0";
  }

  // Redondear a número entero
  const pesoRedondeado = Math.round(pesoEnKg);

  // Convertir a string y agregar separadores de miles
  const pesoString = pesoRedondeado.toString();
  const partes = pesoString.split(".");

  // Agregar punto como separador de miles
  const integerPart = partes[0];
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return formattedInteger;
};
