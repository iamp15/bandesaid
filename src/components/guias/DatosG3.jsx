/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useGuardar } from "../../hooks/useGuardar";
import { PROVIDER_MAP } from "../../constants";

const DatosG3 = ({ proveedor, cargaActual, cargas, setCargas }) => {
  const guardar = useGuardar(setCargas);
  const currentCarga = cargas[PROVIDER_MAP[proveedor]]?.[cargaActual - 1] || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    const newData = {
      p_promedio: e.target.pp.value,
      t_promedio: e.target.tp.value,
      p_guia: e.target.pg.value,
      p_verificado: e.target.pv.value,
    };
    guardar(proveedor, cargaActual, "/datosG4", newData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Control de Calidad</h3>
      <label htmlFor="pp">Peso promedio: </label>
      <input
        type="text"
        id="pp"
        defaultValue={currentCarga?.p_promedio || ""}
      />
      <br />
      <label htmlFor="tp">Temperatura promedio: </label>
      <input
        type="text"
        id="tp"
        defaultValue={currentCarga?.t_promedio || ""}
      />
      <br />
      <br />
      <h3>Control de Peso</h3>
      <label htmlFor="pg">Peso según guía: </label>
      <input type="text" id="pg" defaultValue={currentCarga?.p_guia || ""} />
      <br />
      <label htmlFor="pv">Peso verificado: </label>
      <input
        type="text"
        id="pv"
        defaultValue={currentCarga?.p_verificado || ""}
      />
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
