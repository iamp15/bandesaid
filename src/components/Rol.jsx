import { Link } from "react-router-dom";

export const Rol = ({ setRol }) => {
  return (
    <div className="rol">
      <h2>Escoge tu rol:</h2>
      <Link to={"/proveedor"}>
        <button onClick={() => setRol("Control Pesaje")}>
          Control de Pesaje
        </button>
        <button onClick={() => setRol("Control de Calidad")}>
          Control de Calidad
        </button>
        <button onClick={() => setRol("Verificación de Guías")}>
          Verificación de Guías
        </button>
      </Link>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <footer> Creado por ©iamp15 2024. Todos los derechos reservados.</footer>
    </div>
  );
};
