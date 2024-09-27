import { useState } from "react";
/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import NumGuias from "./NumGuias";
import NumPrecintos from "./NumPrecintos";

const DatosG4 = ({
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
  const [codigos, setCodigos] = useState([]);
  const [precintos, setPrecintos] = useState([]);
  const [numGuias, setNumGuias] = useState(0);
  const [numPrecintos, setNumPrecintos] = useState(0);

  const guardar = (e) => {
    e.preventDefault();
    const newData = {
      codigos_guias: codigos,
      precintos: precintos,
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

    console.log("guardadox4");
    navigate("/revisionguias");
  };

  return (
    <form onSubmit={guardar}>
      <h3>Datos Guía</h3>
      <label htmlFor="n_guias">Cantidad de guías: </label>
      <input
        type="number"
        id="n_guias"
        min={0}
        max={100}
        value={numGuias}
        onChange={(e) => setNumGuias(Number(e.target.value))}
      />
      <br />
      <NumGuias num={numGuias} setCodigos={setCodigos} />
      <br />
      <h3>Datos Precintos</h3>
      <label htmlFor="n_precintos">Cantidad de precintos: </label>
      <input
        type="number"
        id="n_precintos"
        min={0}
        max={100}
        value={numPrecintos}
        onChange={(e) => setNumPrecintos(Number(e.target.value))}
      />
      <br />
      <NumPrecintos num={numPrecintos} setPrecintos={setPrecintos} />
      <br />
      <br />
      <Link to={"/datosg3"}>
        <button type="button">Atras</button>
      </Link>
      <button type="submit">Continuar</button>
    </form>
  );
};

export default DatosG4;
