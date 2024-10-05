/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { PROVIDER_MAP } from "../../../constants";
import { useGuardar } from "../../../hooks/useGuardar";
import { formatDate } from "../../../utils/FormatDate";
import { capitalizeWords } from "../../../utils/Capitalizer";

const DatosG1 = ({
  setCargaActual,
  cargaActual,
  proveedor,
  cargas,
  setCargas,
}) => {
  const key = PROVIDER_MAP[proveedor];
  const guardar = useGuardar(setCargas);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formatCedula = (cedula) => {
      // Remove any existing non-digit characters
      const cleanedCedula = cedula.replace(/\D/g, "");

      // Add dots to the cleaned cedula
      const parts = [];
      for (let i = cleanedCedula.length; i > 0; i -= 3) {
        parts.unshift(cleanedCedula.slice(Math.max(0, i - 3), i));
      }

      return parts.join(".");
    };

    const newData = {
      chofer: capitalizeWords(event.target.nombre.value),
      cedula: formatCedula(event.target.cedula.value),
      marcaVehiculo: capitalizeWords(event.target.marca.value),
      placa: event.target.placa.value.toUpperCase(),
      tk: event.target.tk.value,
      fecha: formatDate(),
    };

    guardar(proveedor, cargaActual, "/datosG2", newData);
  };

  // Get the current carga based on cargaActual and proveedor
  const currentCarga = cargas[key]?.[cargaActual - 1] || {};

  return (
    <>
      <h2>Chofer:</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nombre">Nombre: </label>
        <input
          type="text"
          id="nombre"
          defaultValue={currentCarga?.chofer || ""}
        />
        <br />
        <label htmlFor="placa">Cédula: </label>
        <input
          type="text"
          id="cedula"
          defaultValue={currentCarga?.cedula || ""}
        />
        <br />
        <br />
        <h2>Vehículo:</h2>
        <label htmlFor="marca">Marca: </label>
        <input
          type="text"
          id="marca"
          defaultValue={currentCarga?.marcaVehiculo || ""}
        />
        <br />
        <label htmlFor="placa">Placa: </label>
        <input
          type="text"
          id="placa"
          defaultValue={currentCarga?.placa || ""}
        />
        <br />
        <label htmlFor="tk">Therno King: </label>
        <select name="tk" id="tk" defaultValue={currentCarga?.tk || "si"}>
          <option value="Si">Sí</option>
          <option value="No">No</option>
        </select>
        <br />
        <br />
        <Link to={"/carga"}>
          <button onClick={() => setCargaActual(0)}>Atras</button>
        </Link>
        <button type="submit">Continuar</button>
      </form>
    </>
  );
};

export default DatosG1;
