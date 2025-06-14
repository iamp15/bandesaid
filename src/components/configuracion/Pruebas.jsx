import { Link } from "react-router-dom";
import { db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { PROVIDER_MAP_REVERSE } from "../../constants/constants";

const Pruebas = () => {
  const [cargaEncontrada, setCargaEncontrada] = useState(null);
  const [proveedores, setProveedores] = useState([]);

  const buscarCarga = async () => {
    const cargaId = document.querySelector('input[name="cargaId"]').value;
    const cargaRef = doc(db, "cargas", cargaId);
    const cargaDoc = await getDoc(cargaRef);
    if (cargaDoc.exists()) {
      setCargaEncontrada({
        id: cargaDoc.id,
        ...cargaDoc.data(),
      });
      console.log("Carga encontrada");
    } else {
      alert("Carga no encontrada");
    }
  };

  useEffect(() => {
    if (cargaEncontrada) {
      const filteredProveedores = Object.entries(cargaEncontrada)
        .filter(
          ([key, value]) =>
            key !== "id" && Array.isArray(value) && value.length > 0
        )
        .map(([key]) => key);
      setProveedores(filteredProveedores);
    }
  }, [cargaEncontrada]);

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Lectura de datos</h2>
        <div className="buttons-container">
          <h3>Buscar una carga</h3>
          <input type="text" placeholder="ID de carga" name="cargaId" />
          <button type="button" onClick={buscarCarga}>
            Buscar
          </button>
          {cargaEncontrada ? (
            <div>
              <h4>Carga encontrada:</h4>
              <p>ID: {cargaEncontrada.id}</p>
              <p>Version: {cargaEncontrada.version}</p>
              {/* Mostrar lista de proveedores con longitud > 0 */}
              {cargaEncontrada && console.log(cargaEncontrada)}
              {proveedores.length > 0 && console.log(proveedores)}
              {/* Agrega más campos según sea necesario */}
            </div>
          ) : (
            <p>No se ha encontrado ninguna carga.</p>
          )}
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

export default Pruebas;
