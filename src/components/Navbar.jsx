/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import "./../styles/Navbar.css";

const Navbar = ({
  rol,
  setRol,
  proveedor,
  setProveedor,
  cargaActual,
  setCargaActual,
}) => {
  const rolClicked = () => {
    setRol(null);
    setProveedor(null);
    setCargaActual(0);
  };

  const proveedorClicked = () => {
    setProveedor(null);
    setCargaActual(0);
  };

  const cargaClicked = () => {
    setCargaActual(0);
  };

  return (
    <div className="navbar">
      {rol ? (
        <Link to={"/despachos"} onClick={rolClicked}>
          <p>{rol}</p>
        </Link>
      ) : (
        <span>Bienvenido al sistema Bandes Aid</span>
      )}
      {proveedor ? (
        <Link to={"/proveedor"} onClick={proveedorClicked}>
          <p>{proveedor}</p>
        </Link>
      ) : null}
      {cargaActual > 0 ? (
        <Link to={"/carga"} onClick={cargaClicked}>
          <p>Carga #{cargaActual}</p>
        </Link>
      ) : null}
    </div>
  );
};

export default Navbar;
