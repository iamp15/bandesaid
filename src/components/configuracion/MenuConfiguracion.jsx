import { Link } from "react-router-dom";

const MenuConfiguracion = () => {
  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Configuración</h2>
        <div className="buttons-container">
          <Link to={"/logviewer"}>
            <button>Administrar Logs</button>
          </Link>
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
