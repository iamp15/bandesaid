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
  if (!currentCarga?.destino) missingFields.push("Entidad destino");
  if (!currentCarga?.codigo_espejo) missingFields.push("Código espejo");
  if (!currentCarga?.estadoDestino) missingFields.push("Estado destino");
  if (!currentCarga?.transporte) missingFields.push("Transporte");
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
