/**
 * Devuelve destino, estadoDestino, codigo_espejo y transporte para la guía en el índice dado.
 * Si la carga tiene destinos por guía (destinos_guias[i]) y está definido, usa esos valores;
 * si no, usa los valores a nivel de carga.
 * @param {Object} carga - Datos de la carga
 * @param {number} index - Índice de la guía (0-based)
 * @returns {{ destino: string, estadoDestino: string, codigo_espejo: string, transporte: string }}
 */
export const getDestinoForGuia = (carga, index) => {
  if (!carga) {
    return {
      destino: "",
      estadoDestino: "",
      codigo_espejo: "",
      transporte: "",
    };
  }
  const destinosGuias = carga.destinos_guias || [];
  const destinosDiferentes = carga.destinos_diferentes_por_guia === true;
  const tieneDestinoEnGuia =
    destinosDiferentes &&
    destinosGuias[index] !== undefined &&
    String(destinosGuias[index] || "").trim() !== "";

  if (tieneDestinoEnGuia) {
    const estados = carga.estados_destino_guias || [];
    const codigos = carga.codigos_espejo_guias || [];
    return {
      destino: String(destinosGuias[index] ?? "").trim(),
      estadoDestino: String(estados[index] ?? "").trim(),
      codigo_espejo: String(codigos[index] ?? carga.codigo_espejo ?? "").trim(),
      transporte: String(carga.transporte ?? "").trim(),
    };
  }

  return {
    destino: String(carga.destino ?? "").trim(),
    estadoDestino: String(carga.estadoDestino ?? "").trim(),
    codigo_espejo: String(carga.codigo_espejo ?? "").trim(),
    transporte: String(carga.transporte ?? "").trim(),
  };
};

/**
 * Devuelve lista de destinos únicos (sin repetidos, orden de primera aparición) para usar en "Saliendo de planta".
 * @param {Object} carga - Datos de la carga
 * @param {number} numGuias - Número de guías (carga.codigos_guias?.length ?? 1)
 * @returns {string[]}
 */
export const getDestinosUnicosParaSaliendoPlanta = (carga, numGuias) => {
  if (!carga || numGuias < 1) return [];
  const seen = new Set();
  const result = [];
  for (let i = 0; i < numGuias; i++) {
    const { destino } = getDestinoForGuia(carga, i);
    if (destino && !seen.has(destino)) {
      seen.add(destino);
      result.push(destino);
    }
  }
  return result;
};
