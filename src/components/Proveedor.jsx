/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import { useEstados } from "../contexts/EstadosContext";
import "../styles/Proveedor.css";

const Proveedor = () => {
  const { rol, setProveedor } = useEstados();
  const navigate = useNavigate();

  const handleVolver = () => {
    setProveedor("");
    localStorage.removeItem("proveedor");
    navigate("/despachos");
  };
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
          <Link to="/despachos" className="nav-link">
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
            <Link key={proveedor} to="/carga" className="provider-link">
              <button onClick={() => setProveedor(proveedor)}>
                {proveedor}
              </button>
            </Link>
          ))}
        </div>
        <div className="button-group">
          <button onClick={handleVolver}>Volver</button>
        </div>
      </div>
    </div>
  );
};

export default Proveedor;
