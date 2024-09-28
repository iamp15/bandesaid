/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import CuadroCargas from "./guias/CuadroCargas";

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
      };
      setCargas((prevCargas) => ({
        ...prevCargas,
        [key]: [...prevCargas[key], newCarga],
      }));
    }
  };

  const renderCargas = () => {
    const key = providerMap[proveedor];
    if (!key || cargas[key].length === 0)
      return <p>No hay cargas creadas de {proveedor}</p>;

    return (
      <CuadroCargas
        numCarga={cargas[key].length}
        proveedor={proveedor}
        rol={rol}
        setCargaActual={setCargaActual}
      />
    );
  };

  return (
    <div>
      <button onClick={aggCarga}>Crear carga nueva</button>
      {renderCargas()}
      <br />
      <br />
      <Link to={"/proveedor"}>
        <button>Atrás</button>
      </Link>
    </div>
  );
};

export default Carga;
