/* eslint-disable react/prop-types */
import CuadroCargas from "./CuadroCargas";
import { formatDate } from "../utils/FormatDate";
import { useAlert } from "./alert/AlertContext";
import { Link } from "react-router-dom";

const Carga = ({ cargas, setCargas, rol, proveedor, setCargaActual }) => {
  const providerMap = {
    "Toro Rojo": "tr",
    "Toro Gordo": "tg",
    "Alimentos Lad": "al",
    "Avícola Nam": "av",
  };

  const { askConfirmation } = useAlert();

  const getNextId = (cargasArray) => {
    if (cargasArray.length === 0) return 1;
    return Math.max(...cargasArray.map((carga) => carga.id)) + 1;
  };

  const aggCarga = () => {
    const key = providerMap[proveedor];
    if (key) {
      const newCarga = {
        id: getNextId(cargas[key]),
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
    askConfirmation(
      `¿Estás seguro de que deseas borrar la carga ${
        id + 1
      }? Esta acción no se puede deshacer.`,
      (isConfirmed) => {
        if (key && isConfirmed) {
          setCargas((prevCargas) => ({
            ...prevCargas,
            [key]: prevCargas[key].filter((carga) => carga.id !== id),
          }));
        }
      }
    );
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
      <div className="menu">
        {rol ? (
          renderCargas()
        ) : (
          <div className="error">
            <span>⚠️</span>
            <p>Aun no has seleccionado un rol</p>
            <div className="button-group">
              <Link to="/despachos">
                <button>Volver</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Carga;
