/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const Proveedor = ({ setProveedor, rol }) => {
  const proveedores = [
    "Toro Rojo",
    "Toro Gordo",
    "Avícola Nam",
    "Alimentos Lad",
    "Alimentos Nani",
  ];

  if (!rol) {
    return (
      <div className="error">
        <span>⚠️</span>
        <p>Aun no has seleccionado un rol</p>
        <div className="button-group">
          <Link to="/despachos">
            <button>Volver</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Escoge el proveedor:</h2>
        <div className="buttons-container">
          {proveedores.map((proveedor) => (
            <Link key={proveedor} to="/carga">
              <button onClick={() => setProveedor(proveedor)}>
                {proveedor}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Proveedor;
