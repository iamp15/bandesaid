import { Link } from "react-router-dom";

const MenuConfiguracion = () => {
  const limpiarMemoria = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert("Memoria limpiada");
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Configuración</h2>
        <div className="buttons-container">
          <Link to={"/logviewer"}>
            <button>Administrar Logs</button>
          </Link>
          <Link to={"/pruebas"}>
            <button>Pruebas</button>
          </Link>
          <button onClick={limpiarMemoria}>Limpiar memoria</button>
        </div>
        <div className="button-group">
          <Link to={"/menu"}>
            <button>Volver a inicio</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MenuConfiguracion;
