import { Link } from "react-router-dom";

const SelectorFormatos = () => {
  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Formatos disponibles</h2>
        <div className="buttons-container">
          <Link to={"/distribucion"}>
            <button>Distribución</button>
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

export default SelectorFormatos;
