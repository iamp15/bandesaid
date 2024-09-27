/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import CuadroCargas from "./guias/CuadroCargas";

const Carga = ({ cargas, setCargas, rol, proveedor, setCargaActual }) => {
  const aggCarga = () => {
    const newCarga = {
      id: 0,
      proveedor: proveedor,
    };

    switch (proveedor) {
      case "Toro Rojo":
        newCarga.id = cargas.tr.length + 1;
        setCargas((prevCargas) => ({
          ...prevCargas,
          tr: [...prevCargas.tr, newCarga],
        }));
        break;
      case "Toro Gordo":
        newCarga.id = cargas.tg.length + 1;
        setCargas((prevCargas) => ({
          ...prevCargas,
          tg: [...prevCargas.tg, newCarga],
        }));
        break;
      case "Alimentos Lad":
        newCarga.id = cargas.al.length + 1;
        setCargas((prevCargas) => ({
          ...prevCargas,
          al: [...prevCargas.al, newCarga],
        }));
        break;
      case "Avícola Nam":
        newCarga.id = cargas.av.length + 1;
        setCargas((prevCargas) => ({
          ...prevCargas,
          av: [...prevCargas.av, newCarga],
        }));
        break;
      default:
        break;
    }
  };

  const renderCargas = () => {
    let componentToRender;
    switch (proveedor) {
      case "Toro Rojo":
        componentToRender = cargas.tr.length ? (
          <CuadroCargas
            numCarga={cargas.tr.length}
            proveedor={proveedor}
            rol={rol}
            setCargaActual={setCargaActual}
          />
        ) : (
          <p>No hay cargas creadas de {proveedor}</p>
        );
        break;
      case "Toro Gordo":
        componentToRender = cargas.tg.length ? (
          <CuadroCargas
            numCarga={cargas.tg.length}
            proveedor={proveedor}
            rol={rol}
            setCargaActual={setCargaActual}
          />
        ) : (
          <p>No hay cargas creadas de {proveedor}</p>
        );
        break;
      case "Alimentos Lad":
        componentToRender = cargas.al.length ? (
          <CuadroCargas
            numCarga={cargas.al.length}
            proveedor={proveedor}
            rol={rol}
            setCargaActual={setCargaActual}
          />
        ) : (
          <p>No hay cargas creadas de {proveedor}</p>
        );
        break;
      case "Avícola Nam":
        componentToRender = cargas.av.length ? (
          <CuadroCargas
            numCarga={cargas.av.length}
            proveedor={proveedor}
            rol={rol}
            setCargaActual={setCargaActual}
          />
        ) : (
          <p>No hay cargas creadas de {proveedor}</p>
        );
        break;
      default:
        componentToRender = null;
    }
    return componentToRender;
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
