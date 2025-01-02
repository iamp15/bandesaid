/* eslint-disable react/prop-types */
import CuadroCargas from "./CuadroCargas";
import { formatDate } from "../utils/FormatDate";
import { useAlert } from "./alert/AlertContext";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "./login/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const Carga = ({ cargas, setCargas, rol, proveedor, setCargaActual }) => {
  const providerMap = {
    "Toro Rojo": "tr",
    "Toro Gordo": "tg",
    "Alimentos Lad": "al",
    "Avícola Nam": "av",
  };

  const { askConfirmation } = useAlert();
  const { currentUser, loading } = useAuth(); // Get current user

  if (loading) return <LoadingSpinner />;

  const getNextId = (cargasArray) => {
    if (cargasArray.length === 0) return 1;
    return Math.max(...cargasArray.map((carga) => carga.id)) + 1;
  };

  const aggCarga = () => {
    const key = providerMap[proveedor];
    if (key) {
      const newCarga = {
        id: getNextId(cargas[key]),
        proveedor: proveedor,
        fecha: formatDate(),
        tk: "Si",
        paletas: "No",
        olor: "fresco",
        paredes: "1",
        marca_rubro: "San José",
        lote: "N/A",
      };
      setCargas((prevCargas) => ({
        ...prevCargas,
        [key]: [...prevCargas[key], newCarga],
      }));
    }
  };

  const eliminarCarga = (id) => {
    const key = providerMap[proveedor];
    askConfirmation(
      `¿Estás seguro de que deseas borrar la carga ${id}? Esta acción no se puede deshacer.`,
      async (isConfirmed) => {
        if (key && isConfirmed) {
          try {
            // Find the carga that's being deleted
            const cargaToDelete = cargas[key].find((carga) => carga.id === id);

            // Log the deletion in Firestore
            await addDoc(collection(db, "deletedCargas"), {
              cargaId: id,
              proveedor: proveedor,
              deletedBy: {
                email: currentUser.name,
                uid: currentUser.uid,
              },
              deletedAt: new Date().toISOString(),
              cargaData: cargaToDelete, // Store all carga data for reference
              userRole: rol,
            });

            // Remove the carga from state
            setCargas((prevCargas) => ({
              ...prevCargas,
              [key]: prevCargas[key].filter((carga) => carga.id !== id),
            }));

            console.log(`Carga ${id} deleted and logged successfully`);
          } catch (error) {
            console.error("Error logging carga deletion:", error);
            // You might want to show an error message to the user here
          }
        }
      }
    );
  };

  const renderCargas = () => {
    const key = providerMap[proveedor];
    const cargasForProvider = cargas[key] || [];

    return (
      <div className="carga-container">
        <p>Cargas creadas de {proveedor}:</p>
        {cargasForProvider.length === 0 ? (
          <p>No hay cargas creadas</p>
        ) : (
          <CuadroCargas
            cargas={cargasForProvider}
            rol={rol}
            setCargaActual={setCargaActual}
            eliminarCarga={eliminarCarga}
          />
        )}
        <button className="crear-carga-button" onClick={aggCarga}>
          Crear nueva carga
        </button>
      </div>
    );
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        {rol && proveedor ? (
          renderCargas()
        ) : (
          <div className="error">
            <span>⚠️</span>
            <p>Aun no has seleccionado un rol</p>
            <div className="button-group">
              <Link to="/despachos">
                <button>Volver</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Carga;
