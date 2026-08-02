export const formatoFechaElaboracion = (valor, fallback = "N/A") => {
  if (!valor) return fallback;

  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    const dd = String(valor.getDate()).padStart(2, "0");
    const mm = String(valor.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${valor.getFullYear()}`;
  }

  if (typeof valor.toDate === "function") {
    const d = valor.toDate();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
  }

  const str = String(valor);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [yyyy, mm, dd] = str.split("-");
    return `${dd}/${mm}/${yyyy}`;
  }
  return str;
};