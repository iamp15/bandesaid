/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const Proveedor = ({ setProveedor }) => {
  return (
    <div>
      <h2>Escoge el proveedor:</h2>
      <div>
        <Link to={"/carga"}>
          <button onClick={() => setProveedor("Toro Rojo")}>Toro Rojo</button>
          <button onClick={() => setProveedor("Toro Gordo")}>Toro Gordo</button>
          <button onClick={() => setProveedor("Avícola Nam")}>
            Avícola Nam
          </button>
          <button onClick={() => setProveedor("Alimentos Lad")}>
            Alimentos Lad
          </button>
        </Link>
      </div>
      <br />
      <br />
      <Link to={"/"}>
        <button>Atrás</button>
      </Link>
    </div>
  );
};

export default Proveedor;
