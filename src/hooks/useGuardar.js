import { useNavigate } from "react-router-dom";
import { PROVIDER_MAP } from "../constants/constants";

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

    navigate(nextRoute);
  };

  return guardar;
};
