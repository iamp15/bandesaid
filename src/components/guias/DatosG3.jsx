/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";

const DatosG3 = ({
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

  const guardar = (e) => {
    e.preventDefault();
    const newData = {
      p_promedio: e.target.pp.value,
      t_promedio: e.target.tp.value,
      p_guia: e.target.pg.value,
      p_verificado: e.target.pv.value,
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

    console.log("guardadox3");
    navigate("/datosg4");
  };

  return (
    <form onSubmit={guardar}>
      <h3>Control de Calidad</h3>
      <label htmlFor="pp">Peso promedio: </label>
      <input type="text" id="pp" />
      <br />
      <label htmlFor="tp">Temperatura promedio: </label>
      <input type="text" id="tp" />
      <br />
      <br />
      <h3>Control de Peso</h3>
      <label htmlFor="pg">Peso según guía: </label>
      <input type="text" id="pg" />
      <br />
      <label htmlFor="pv">Peso verificado: </label>
      <input type="text" id="pv" />
      <br />
      <br />

      <Link to={"/datosg2"}>
        <button>Atras</button>
      </Link>
      <input type="submit" value="Continuar" />
    </form>
  );
};

export default DatosG3;
