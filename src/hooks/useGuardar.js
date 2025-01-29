import { useNavigate } from "react-router-dom";
import { PROVIDER_MAP } from "../constants/constants";
import { useAuth } from "../components/login/AuthContext";
import useLogger from "./useLogger";

export const useGuardar = (setCargas) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const logger = useLogger();

  const guardar = (proveedor, cargaActual, nextRoute, newData) => {
    const key = PROVIDER_MAP[proveedor];

    setCargas((prevCargas) => ({
      ...prevCargas,
      [key]: prevCargas[key].map((carga) =>
        carga.id === cargaActual ? { ...carga, ...newData } : carga
      ),
    }));
    logger.info(`Carga ${cargaActual} updated by ${currentUser.name}`);

    navigate(nextRoute);
  };

  return guardar;
};
