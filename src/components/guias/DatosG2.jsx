/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useGuardar } from "../../hooks/useGuardar";
import { PROVIDER_MAP } from "../../constants";

const DatosG2 = ({ proveedor, cargaActual, setCargas, cargas }) => {
  const guardar = useGuardar(setCargas);
  const currentCarga = cargas[PROVIDER_MAP[proveedor]]?.[cargaActual - 1] || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    const newData = {
      empresa: document.getElementById("empresa").value,
      destino: document.getElementById("destino").value,
    };
    guardar(proveedor, cargaActual, "/datosG3", newData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Distribuidora: </h2>
      <label htmlFor="empresa">Empresa: </label>
      <input
        type="text"
        id="empresa"
        defaultValue={currentCarga?.empresa || ""}
      />
      <br />
      <br />
      <label htmlFor="destino">Destino: </label>
      <input
        type="text"
        id="destino"
        defaultValue={currentCarga?.destino || ""}
      />
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
