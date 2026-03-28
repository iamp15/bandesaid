export const PROVIDER_MAP = {
  "Toro Rojo": "tr",
  "Toro Gordo": "tg",
  "Alimentos Lad": "al",
  "Avícola Nam": "av",
  "Alimentos Nani": "an",
};
export const PROVIDER_MAP_REVERSE = {
  tr: "Toro Rojo",
  tg: "Toro Gordo",
  al: "Alimentos Lad",
  av: "Avícola Nam",
  an: "Alimentos Nani",
};

export const RUBRO = "Pollo";

export const PLANTAS = {
  superPollo: {
    id: "superPollo",
    nombre: "Super Pollo",
    GALPON: "Súper Pollo Carrizal",
    MARCA: {
      0: { nombre: "San José", CND: "072249161" },
      1: { nombre: "Super Pollo", CND: "041811024" },
    },
    PERMISO_SANITARIO: "MIR-TIPO-I-000415086",
  },
  laPonderosa: {
    id: "laPonderosa",
    nombre: "La Ponderosa",
    GALPON: "La Ponderosa",
    MARCA: {
      0: { nombre: "Pollo Estrella", CND: "052555191" },
    },
    PERMISO_SANITARIO: "MIR-TIPO-I-000479880",
  },
};

export const PLANTA_DEFAULT = "superPollo";

export const LOTE = {
  numero: "N/A",
  elaboracion: "N/A",
  vencimiento: "N/A",
};
