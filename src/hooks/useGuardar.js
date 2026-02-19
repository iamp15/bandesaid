import { useNavigate } from "react-router-dom";
import { PROVIDER_MAP } from "../constants/constants";
import { saveLog } from "../utils/LogSystem";

export const useGuardar = (setCargas) => {
  const navigate = useNavigate();

  const guardar = (proveedor, cargaActual, nextRoute, newData) => {
    const key = PROVIDER_MAP[proveedor];

    setCargas((prevCargas) => ({
      ...prevCargas,
      [key]: prevCargas[key].map((carga) =>
        carga.id === cargaActual ? { ...carga, ...newData } : carga
      ),
    }));
    const filteredData = Object.entries(newData).filter(
      ([key]) => key !== "editHistory"
    );
    saveLog(
      `Carga ${cargaActual} of ${proveedor} updated with data: ${JSON.stringify(
        Object.fromEntries(filteredData)
      )}`
    );
    console.log("carga local actualizada");
    navigate(nextRoute);
  };

  return guardar;
};
