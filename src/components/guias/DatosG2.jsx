/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";

const DatosG2 = ({
  proveedor,
  cargaActual,
  cargasTr,
  setCargasTr,
  cargasTg,
  setCargasTg,
  cargasAv,
  setCargasAv,
  cargasAl,
  setCargasAl,
}) => {
  const navigate = useNavigate();

  const guardar2 = (event) => {
    event.preventDefault();

    const newData = {
      empresa: event.target.empresa.value,
      destino: event.target.destino.value,
    };

    const updateCargas = (setCargasFn, cargasArr) => {
      setCargasFn((prevCargas) =>
        prevCargas.map((carga) =>
          carga.id === cargaActual ? { ...carga, ...newData } : carga
        )
      );
    };

    switch (proveedor) {
      case "Toro Rojo":
        updateCargas(setCargasTr, cargasTr);
        break;
      case "Toro Gordo":
        updateCargas(setCargasTg, cargasTg);
        break;
      case "Avícola Nam":
        updateCargas(setCargasAv, cargasAv);
        break;
      case "Alimentos Lad":
        updateCargas(setCargasAl, cargasAl);
        break;
      default:
        break;
    }
    console.log("guardadox2");
    navigate("/datosg3");
  };

  return (
    <form onSubmit={guardar2}>
      <h2>Distribuidora: </h2>
      <label htmlFor="empresa">Empresa: </label>
      <input type="text" id="empresa" />
      <br />
      <br />
      <label htmlFor="destino">Destino: </label>
      <input type="text" id="destino" />
      <br />
      <br />
      <Link to={"/datosg1"}>
        <button>Atras</button>
      </Link>
      <input type="submit" value="Continuar" />
    </form>
  );
};

export default DatosG2;
