import { formatPesoAplicacion } from "./convertPesoGuiaSADA";
import { getDestinoForGuia } from "./destinoPorGuia";

/**
 * Normaliza un texto para comparación flexible (minúsculas, sin espacios extras, sin caracteres especiales)
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
 * Comparación estricta: mismo valor tras trim (sin flexibilidad).
 */
const compareStrict = (val1, val2) => {
  const s1 = String(val1 ?? "").trim();
  const s2 = String(val2 ?? "").trim();
  return s1 === s2;
};

/**
 * Comparación estricta para números/códigos: mismo valor tras quitar espacios y puntos (ej. cédula, código espejo).
 */
const compareStrictNumber = (val1, val2) => {
  const normalize = (v) =>
    String(v ?? "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .trim();
  return normalize(val1) === normalize(val2);
};

/**
 * Compara dos textos de forma permisiva (flexible)
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
 * Quita acentos/diacríticos de un texto (José -> Jose, María -> Maria).
 */
const removeAccents = (str) => {
  if (!str) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

/**
 * Compara dos nombres de chofer de forma flexible: coinciden si hay
 * al menos un nombre (p.ej. Antonio, José) y un apellido (p.ej. Pérez, Bonilla) en común.
 * Se ignoran acentos (José = Jose, Pérez = Perez).
 */
const compareNombreChofer = (nombre1, nombre2) => {
  const words = (str) => {
    if (!str) return [];
    return removeAccents(String(str))
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
 * @param {number} [guiaIndex] - Índice de la guía con la que se compara (si hay varias); si no se pasa, se usa el destino único de la carga
 * @returns {Object} - Resultados de la comparación
 */
export const compareGuiaSADA = (datosExtraidos, currentCarga, guiaIndex) => {
  const resultados = {};

  // Comparar número de guía (estricto: debe ser exactamente el mismo número)
  const codigosGuias = currentCarga.codigos_guias || [];
  const numeroGuiaExtraido = String(datosExtraidos.numeroGuia ?? "").trim();
  const existeEnArreglo = codigosGuias.some((codigo) =>
    compareStrict(codigo, numeroGuiaExtraido)
  );

  // Determinar índice de guía para destino: el pasado o el que coincide con el número escaneado
  const indexParaDestino =
    guiaIndex !== undefined && guiaIndex !== null
      ? guiaIndex
      : codigosGuias.findIndex((c) => compareStrict(c, numeroGuiaExtraido));
  const destinoGuia =
    indexParaDestino >= 0
      ? getDestinoForGuia(currentCarga, indexParaDestino)
      : getDestinoForGuia(currentCarga, 0);

  // Coincide solo si el número extraído es exactamente igual al de la guía comparada (seleccionada o única)
  const codigoManualComparar =
    indexParaDestino >= 0 && codigosGuias[indexParaDestino] !== undefined
      ? codigosGuias[indexParaDestino]
      : codigosGuias[0];
  const numeroGuiaCoincide =
    codigoManualComparar !== undefined
      ? compareStrict(codigoManualComparar, numeroGuiaExtraido)
      : false;

  resultados.numeroGuia = {
    coincide: numeroGuiaCoincide,
    valorExtraido: datosExtraidos.numeroGuia || "",
    valorManual:
      indexParaDestino >= 0 && codigosGuias[indexParaDestino] !== undefined
        ? codigosGuias[indexParaDestino]
        : codigosGuias.length > 0
          ? codigosGuias
          : "",
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

  // Comparar cédula del conductor (estricto: mismo número)
  resultados.cedula = {
    coincide: compareStrictNumber(
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

  // Comparar empresa destino (razón social) usando destino de la guía correspondiente
  const razonSocialExtraida = datosExtraidos.empresaDestino?.razonSocial || "";
  resultados.empresaDestino = {
    coincide: compareText(razonSocialExtraida, destinoGuia.destino || ""),
    valorExtraido: razonSocialExtraida,
    valorManual: destinoGuia.destino || "",
  };

  // Comparar código espejo (estricto: debe ser el mismo número)
  const codigoExtraido = datosExtraidos.empresaDestino?.codigo || "";
  resultados.codigo_espejo = {
    coincide: compareStrictNumber(
      codigoExtraido,
      destinoGuia.codigo_espejo || ""
    ),
    valorExtraido: codigoExtraido,
    valorManual: destinoGuia.codigo_espejo || "",
  };

  // Comparar estado
  const estadoExtraido = datosExtraidos.empresaDestino?.estado || "";
  resultados.estado = {
    coincide: compareText(estadoExtraido, destinoGuia.estadoDestino || ""),
    valorExtraido: estadoExtraido,
    valorManual: destinoGuia.estadoDestino || "",
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

  // Comparar cantidad de rubros (según la guía seleccionada o la que coincida con el número escaneado)
  const pesosGuias = currentCarga.pesos_guias || [];
  const cantidadRubrosExtraida = datosExtraidos.cantidadRubros || 0;

  const pesosGuiasValidos = pesosGuias
    .map((p, i) => ({ peso: p, index: i }))
    .filter(({ peso }) => parsePeso(peso) > 0);

  let coincidePeso = false;
  let valorManualPeso = null;
  let valorManualFormateado = null;

  // Si tenemos un índice de guía definido, comparar solo con el peso de esa guía
  if (indexParaDestino >= 0 && pesosGuias[indexParaDestino] !== undefined) {
    const pesoManual = parsePeso(pesosGuias[indexParaDestino]);
    valorManualFormateado = formatPesoAplicacion(pesoManual);
    if (pesoManual > 0) {
      valorManualPeso = pesoManual;
      coincidePeso = comparePesos(cantidadRubrosExtraida, pesoManual);
    }
  } else if (pesosGuiasValidos.length > 0) {
    // Sin índice: buscar coincidencia con alguna guía existente
    for (let i = 0; i < pesosGuiasValidos.length; i++) {
      const pesoManual = parsePeso(pesosGuiasValidos[i].peso);
      if (comparePesos(cantidadRubrosExtraida, pesoManual)) {
        coincidePeso = true;
        valorManualPeso = pesoManual;
        valorManualFormateado = formatPesoAplicacion(pesoManual);
        break;
      }
    }
    if (!coincidePeso && pesosGuiasValidos.length > 0) {
      valorManualPeso = parsePeso(pesosGuiasValidos[0].peso);
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
