import { formatPesoAplicacion } from "./convertPesoGuiaSADA";

/**
 * Normaliza un texto para comparación (minúsculas, sin espacios extras, sin caracteres especiales)
 */
const normalizeText = (text) => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
};

/**
 * Compara dos textos de forma permisiva
 */
const compareText = (text1, text2) => {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);

  // Si ambos están vacíos, coinciden
  if (!normalized1 && !normalized2) return true;
  
  // Si uno está vacío y el otro no, no coinciden
  if (!normalized1 || !normalized2) return false;

  // Si son exactamente iguales, coinciden
  if (normalized1 === normalized2) return true;
  
  // Verificar si uno contiene al otro (solo si ambos tienen contenido)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1))
    return true;
  
  return false;
};

/**
 * Compara dos nombres de chofer de forma flexible: coinciden si hay
 * al menos un nombre (p.ej. Antonio, José) y un apellido (p.ej. Pérez, Bonilla) en común.
 * Se toma el nombre más largo como referencia: últimas 2 palabras = apellidos, el resto = nombres.
 */
const compareNombreChofer = (nombre1, nombre2) => {
  const words = (str) => {
    if (!str) return [];
    return String(str)
      .toUpperCase()
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .filter(Boolean);
  };

  const w1 = words(nombre1);
  const w2 = words(nombre2);

  if (w1.length === 0 && w2.length === 0) return true;
  if (w1.length === 0 || w2.length === 0) return false;

  // Si coinciden exactamente (o uno contiene al otro), ya está
  const s1 = w1.join(" ");
  const s2 = w2.join(" ");
  if (s1 === s2) return true;
  if (s1.includes(s2) || s2.includes(s1)) return true;

  // Referencia = el nombre con más palabras (el "completo"); el otro es el "parcial"
  const [refWords, queryWords] = w1.length >= w2.length ? [w1, w2] : [w2, w1];
  const refSet = new Set(refWords);
  const querySet = new Set(queryWords);

  // Referencia de 1 sola palabra: coincide si la query contiene esa palabra
  if (refWords.length === 1) {
    return querySet.has(refWords[0]);
  }

  // Últimas 2 palabras = apellidos; el resto = nombres
  const apellidosRef = new Set(refWords.slice(-2));
  const nombresRef = new Set(refWords.slice(0, -2));

  const tieneNombre = [...querySet].some((w) => nombresRef.has(w));
  const tieneApellido = [...querySet].some((w) => apellidosRef.has(w));

  return tieneNombre && tieneApellido;
};

/**
 * Convierte un valor de peso formateado a número
 */
const parsePeso = (pesoFormateado) => {
  if (typeof pesoFormateado === "number") return pesoFormateado;
  if (!pesoFormateado) return 0;

  // Remover formato: punto miles, coma decimal
  const cleaned = String(pesoFormateado)
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
};

/**
 * Compara dos valores numéricos de peso (en Kg)
 */
const comparePesos = (peso1, peso2) => {
  const num1 = typeof peso1 === "number" ? peso1 : parsePeso(peso1);
  const num2 = typeof peso2 === "number" ? peso2 : parsePeso(peso2);

  // Redondear a enteros para comparación
  const rounded1 = Math.round(num1);
  const rounded2 = Math.round(num2);

  return rounded1 === rounded2;
};

/**
 * Compara fechas en diferentes formatos
 */
const compareFechas = (fecha1, fecha2) => {
  if (!fecha1 || !fecha2) return false;

  // Normalizar fechas (remover separadores y espacios)
  const normalizeFecha = (fecha) => {
    return String(fecha)
      .replace(/[-/]/g, "")
      .replace(/\s/g, "")
      .toLowerCase();
  };

  return normalizeFecha(fecha1) === normalizeFecha(fecha2);
};

/**
 * Compara los datos extraídos de la guía SADA con los datos manuales de la carga
 * @param {Object} datosExtraidos - Datos extraídos de la guía SADA
 * @param {Object} currentCarga - Datos actuales de la carga
 * @returns {Object} - Resultados de la comparación
 */
export const compareGuiaSADA = (datosExtraidos, currentCarga) => {
  const resultados = {};

  // Comparar número de guía
  const codigosGuias = currentCarga.codigos_guias || [];
  const existeEnArreglo = codigosGuias.some(
    (codigo) => String(codigo).trim() === String(datosExtraidos.numeroGuia).trim()
  );

  resultados.numeroGuia = {
    coincide: existeEnArreglo,
    valorExtraido: datosExtraidos.numeroGuia || "",
    valorManual: codigosGuias.length > 0 ? codigosGuias : "",
    existeEnArreglo,
  };

  // Comparar conductor (nombre) con lógica flexible: al menos un nombre y un apellido
  resultados.conductor = {
    coincide: compareNombreChofer(
      datosExtraidos.conductor,
      currentCarga.chofer || ""
    ),
    valorExtraido: datosExtraidos.conductor || "",
    valorManual: currentCarga.chofer || "",
  };

  // Comparar cédula del conductor
  resultados.cedula = {
    coincide: compareText(
      datosExtraidos.conductorCedula || "",
      currentCarga.cedula || ""
    ),
    valorExtraido: datosExtraidos.conductorCedula || "",
    valorManual: currentCarga.cedula || "",
  };

  // Comparar placa
  resultados.placa = {
    coincide: compareText(datosExtraidos.placa, currentCarga.placa || ""),
    valorExtraido: datosExtraidos.placa || "",
    valorManual: currentCarga.placa || "",
  };

  // Comparar empresa destino (razón social)
  const razonSocialExtraida = datosExtraidos.empresaDestino?.razonSocial || "";
  resultados.empresaDestino = {
    coincide: compareText(razonSocialExtraida, currentCarga.destino || ""),
    valorExtraido: razonSocialExtraida,
    valorManual: currentCarga.destino || "",
  };

  // Comparar código espejo (código de empresa destino)
  const codigoExtraido = datosExtraidos.empresaDestino?.codigo || "";
  resultados.codigo_espejo = {
    coincide: compareText(codigoExtraido, currentCarga.codigo_espejo || ""),
    valorExtraido: codigoExtraido,
    valorManual: currentCarga.codigo_espejo || "",
  };

  // Comparar estado
  const estadoExtraido = datosExtraidos.empresaDestino?.estado || "";
  resultados.estado = {
    coincide: compareText(estadoExtraido, currentCarga.estadoDestino || ""),
    valorExtraido: estadoExtraido,
    valorManual: currentCarga.estadoDestino || "",
  };

  // Comparar fecha
  resultados.fecha = {
    coincide: compareFechas(
      datosExtraidos.fecha,
      currentCarga.fecha_guia_sada || currentCarga.fecha || ""
    ),
    valorExtraido: datosExtraidos.fecha || "",
    valorManual: currentCarga.fecha_guia_sada || currentCarga.fecha || "",
  };

  // Comparar cantidad de rubros
  const pesosGuias = currentCarga.pesos_guias || [];
  const cantidadRubrosExtraida = datosExtraidos.cantidadRubros || 0;

  // Filtrar elementos vacíos, null, undefined o 0 del array
  const pesosGuiasValidos = pesosGuias.filter(peso => {
    const pesoParseado = parsePeso(peso);
    return pesoParseado > 0;
  });

  // Si hay múltiples guías válidas, comparar con todas
  let coincidePeso = false;
  let valorManualPeso = null;
  let valorManualFormateado = null;

  if (pesosGuiasValidos.length > 0) {
    // Buscar coincidencia con alguna guía existente
    for (let i = 0; i < pesosGuiasValidos.length; i++) {
      const pesoManual = parsePeso(pesosGuiasValidos[i]);
      if (comparePesos(cantidadRubrosExtraida, pesoManual)) {
        coincidePeso = true;
        valorManualPeso = pesoManual;
        valorManualFormateado = formatPesoAplicacion(pesoManual);
        break;
      }
    }

    // Si no hay coincidencia, usar el primer valor para mostrar
    if (!coincidePeso && pesosGuiasValidos.length > 0) {
      valorManualPeso = parsePeso(pesosGuiasValidos[0]);
      valorManualFormateado = formatPesoAplicacion(valorManualPeso);
    }
  } else {
    // Si el array de pesos está vacío, comparar con el peso total de la carga
    const pesoTotal = currentCarga.p_total;
    
    // Verificar si p_total existe (puede ser 0, que es válido)
    if (pesoTotal !== undefined && pesoTotal !== null && pesoTotal !== "") {
      // Parsear el peso total (puede venir como string formateado o número)
      valorManualPeso = parsePeso(pesoTotal);
      
      // Siempre establecer el valor formateado si hay un peso total
      valorManualFormateado = formatPesoAplicacion(valorManualPeso);
      
      // Comparar solo si el peso parseado es mayor que 0
      if (valorManualPeso > 0) {
        coincidePeso = comparePesos(cantidadRubrosExtraida, valorManualPeso);
      }
    }
  }

  resultados.cantidadRubros = {
    coincide: coincidePeso,
    valorExtraido: cantidadRubrosExtraida,
    valorExtraidoFormateado: datosExtraidos.cantidadRubrosFormateado || "",
    valorManual: valorManualPeso,
    valorManualFormateado: valorManualFormateado || "",
  };

  return resultados;
};
