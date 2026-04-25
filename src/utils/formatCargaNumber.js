export const formatCargaNumber = (cargaNumber) => {
  const numericCargaNumber = Number(cargaNumber);

  if (!Number.isFinite(numericCargaNumber)) return "";

  return numericCargaNumber < 10
    ? `0${numericCargaNumber}`
    : `${numericCargaNumber}`;
};

export const formatCargaGuiaNumber = (cargaNumber, guiaIndex, totalGuias) => {
  if (totalGuias === 1) return formatCargaNumber(cargaNumber);

  return `${cargaNumber}.${guiaIndex + 1}`;
};
