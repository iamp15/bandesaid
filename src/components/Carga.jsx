/* eslint-disable react/prop-types */
import CuadroCargas from "./CuadroCargas";
import { formatDate } from "../utils/FormatDate";

const Carga = ({ cargas, setCargas, rol, proveedor, setCargaActual }) => {
  const providerMap = {
    "Toro Rojo": "tr",
    "Toro Gordo": "tg",
    "Alimentos Lad": "al",
    "Avícola Nam": "av",
  };

  const aggCarga = () => {
    const key = providerMap[proveedor];
    if (key) {
      const newCarga = {
        id: cargas[key].length + 1,
        proveedor: proveedor,
        fecha: formatDate(),
      };
      setCargas((prevCargas) => ({
        ...prevCargas,
        [key]: [...prevCargas[key], newCarga],
      }));
    }
  };

  const eliminarCarga = (id) => {
    const key = providerMap[proveedor];
    if (key) {
      setCargas((prevCargas) => ({
        ...prevCargas,
        [key]: prevCargas[key].filter((carga) => carga.id !== id),
      }));
    }
  };

  const renderCargas = () => {
    const key = providerMap[proveedor];
    const cargasForProvider = cargas[key] || [];

    return (
      <div className="carga-container">
        <p>Cargas creadas de {proveedor}:</p>
        {cargasForProvider.length === 0 ? (
          <p>No hay cargas creadas</p>
        ) : (
          <CuadroCargas
            cargas={cargasForProvider}
            rol={rol}
            setCargaActual={setCargaActual}
            eliminarCarga={eliminarCarga}
          />
        )}
        <button className="crear-carga-button" onClick={aggCarga}>
          Crear nueva carga
        </button>
      </div>
    );
  };

  return (
    <div className="wrap-container">
      <div className="menu">{renderCargas()}</div>
    </div>
  );
};

export default Carga;
