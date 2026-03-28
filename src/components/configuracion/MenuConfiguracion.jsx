import { Link } from "react-router-dom";
import { useEstados } from "../../contexts/EstadosContext";
import { PLANTAS } from "../../constants/constants";

const MenuConfiguracion = () => {
  const {
    planta,
    setPlanta,
    setCargaActual,
    setProveedor,
    setRol,
  } = useEstados();

  const handlePlantaChange = (nuevaPlanta) => {
    setPlanta(nuevaPlanta);
    setCargaActual(0);
    setProveedor("");
    setRol("");
  };

  const limpiarMemoria = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert("Memoria limpiada");
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Configuración</h2>
        <div className="planta-selector" style={{ marginBottom: "1rem" }}>
          <p className="label-bold">Planta:</p>
          {Object.entries(PLANTAS).map(([id, { nombre }]) => (
            <label key={id} style={{ display: "block", marginBottom: "0.5rem" }}>
              <input
                type="radio"
                name="planta"
                value={id}
                checked={planta === id}
                onChange={() => handlePlantaChange(id)}
              />
              {" "}{nombre}
            </label>
          ))}
        </div>
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
