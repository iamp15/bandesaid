/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useAuth } from "./login/AuthContext";
import "./../styles/Navbar.css";

const Navbar = ({
  rol,
  setRol,
  proveedor,
  setProveedor,
  cargaActual,
  setCargaActual,
}) => {
  const { currentUser, userData, logout } = useAuth();

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

      <div className="navbar-end">
        {currentUser ? (
          <div className="user-info">
            {/* Show user email if userData is not yet loaded */}
            <span className="username">
              {userData ? userData.name : currentUser.name}
              <span onClick={() => logout()}> [Logout]</span>
            </span>
          </div>
        ) : (
          <span>Guest</span>
        )}
      </div>
    </div>
  );
};

export default Navbar;
