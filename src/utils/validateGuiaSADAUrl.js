/**
 * Valida que una URL sea una URL válida de guía SADA
 * @param {string} url - URL a validar
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateGuiaSADAUrl = (url) => {
  if (!url || typeof url !== "string") {
    return { isValid: false, error: "URL no válida" };
  }

  // Patrón esperado: https://sica.sunagro.gob.ve/guias/...
  const sadaUrlPattern = /^https:\/\/sica\.sunagro\.gob\.ve\/guias\/.+$/i;

  if (!sadaUrlPattern.test(url.trim())) {
    return {
      isValid: false,
      error: "La URL no corresponde a una guía SADA válida",
    };
  }

  return { isValid: true };
};
