/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const Proveedor = ({ setProveedor }) => {
  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Escoge el proveedor:</h2>
        <div className="buttons-container">
          <Link to={"/carga"}>
            <button onClick={() => setProveedor("Toro Rojo")}>Toro Rojo</button>
            <button onClick={() => setProveedor("Toro Gordo")}>
              Toro Gordo
            </button>
            <button onClick={() => setProveedor("Avícola Nam")}>
              Avícola Nam
            </button>
            <button onClick={() => setProveedor("Alimentos Lad")}>
              Alimentos Lad
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Proveedor;
