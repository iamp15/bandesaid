import { useState, useEffect } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import ControlPesaje from "./components/controlPesaje/ControlPesaje";
import ControlCalidad1 from "./components/controlCalidad/ControlCalidad1";
import Carga from "./components/Carga";
import { Rol } from "./components/Rol";
import DatosG1 from "./components/guias/chofer-vehiculo/DatosG1";
import Proveedor from "./components/Proveedor";
import DatosG2 from "./components/guias/distribuidora/DatosG2";
import DatosG3 from "./components/guias/controles/DatosG3";
import DatosG4 from "./components/guias/guias/DatosG4";
import ControlPesaje2 from "./components/controlPesaje/ControlPesaje2";
import RevisionGuias from "./components/guias/RevisionGuias";
import FormulariosGuia from "./components/guias/FormulariosGuia";
import Navbar from "./components/Navbar";
import ControlPesaje3 from "./components/controlPesaje/ControlPesaje3";
import Menu from "./components/Menu";
import ControlCalidad2 from "./components/controlCalidad/ControlCalidad2";
import ControlCalidad3 from "./components/controlCalidad/ControlCalidad3";
import ControlCalidad4 from "./components/controlCalidad/ControlCalidad4";
import { db } from "./firebase/config";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import LoginPage from "./components/login/LoginPage";
import ProtectedRoute from "./components/login/ProtectedRoute";
import { useAuth } from "./components/login/AuthContext";
import { formatDate2 } from "./utils/FormatDate";
import LoadingSpinner from "./components/LoadingSpinner";
import UnderConstruction from "./components/UnderConstruction";
import useLogger from "./hooks/useLogger";
import { useAlert } from "./components/alert/AlertContext";
import Sistemas1 from "./components/sistemas/Sistemas1";
import Sistemas2 from "./components/sistemas/Sistemas2";

function App() {
  const [rol, setRol] = useState(() => {
    const savedRol = sessionStorage.getItem("rol");
    return savedRol ? savedRol : "";
  });
  const [proveedor, setProveedor] = useState(() => {
    const savedProveedor = sessionStorage.getItem("proveedor");
    return savedProveedor ? savedProveedor : "";
  });
  const [cargas, setCargas] = useState({
    tr: [],
    tg: [],
    al: [],
    av: [],
    an: [],
  });
  const [cargaActual, setCargaActual] = useState(() => {
    // Initialize cargaActual from sessionStorage or use default value
    const savedCargaActual = sessionStorage.getItem("cargaActual");
    return savedCargaActual ? parseInt(savedCargaActual) : 0;
  });
  const [guias_precintos, setGuias_precintos] = useState(() => {
    const savedGuias_precintos = sessionStorage.getItem("guias_precintos");
    return savedGuias_precintos
      ? JSON.parse(savedGuias_precintos)
      : {
          guias: "",
          precintos: "",
        };
  });
  const { currentUser, loading } = useAuth();
  const today = formatDate2();
  const docRef = doc(db, "cargas", today);
  const logger = useLogger();
  const { addAlert } = useAlert();

  useEffect(() => {
    if (!currentUser) return; // Don't set up listener if not authenticated

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setCargas(snapshot.data());
      } else {
        setDoc(docRef, cargas);
        logger.info(`Write to Firestore: Created new cargas on ${today}`);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [currentUser]);

  const checkOnlineStatus = () => {
    return navigator.onLine;
  };

  const updateCargas = async (newCargas) => {
    if (!currentUser) return; // Don't attempt update if not authenticated

    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }

    // If newCargas is a function, execute it to get the new state
    const updatedCargas =
      typeof newCargas === "function" ? newCargas(cargas) : newCargas;

    const saveToFirestore = async (data, retries = 3) => {
      try {
        await setDoc(doc(db, "cargas", today), data);
        logger.info(`Write to Firestore: Updated cargas on ${today}`);
        console.log("Cargas updated!");
        setCargas(data);
      } catch (error) {
        if (retries > 0) {
          logger.warn(`Retrying to update cargas: ${retries} attempts left`);
          console.error("Error updating cargas:", error);
          setTimeout(() => saveToFirestore(data, retries - 1), 1000);
          addAlert("Hubo un error al guardar la información", "error");
        } else {
          logger.error(`Error updating cargas: ${error}`);
          console.error("Error updating cargas:", error);
          addAlert("Hubo un error al guardar la información", "error");
        }
      }
    };
    saveToFirestore(updatedCargas);
  };

  // Save cargaActual to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("cargaActual", cargaActual.toString());
  }, [cargaActual]);

  useEffect(() => {
    sessionStorage.setItem("rol", rol);
  }, [rol]);

  useEffect(() => {
    sessionStorage.setItem("proveedor", proveedor);
  }, [proveedor]);

  useEffect(() => {
    sessionStorage.setItem("guias_precintos", JSON.stringify(guias_precintos));
  }, [guias_precintos]);

  console.log(cargas);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Navbar
        rol={rol}
        setRol={setRol}
        proveedor={proveedor}
        setProveedor={setProveedor}
        cargaActual={cargaActual}
        setCargaActual={setCargaActual}
      />
      <div className="content-wrapper">
        <Routes>
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/despachos"
            element={
              <Rol
                setRol={setRol}
                cargas={cargas}
                setCargas={updateCargas}
                setProveedor={setProveedor}
                setCargaActual={setCargaActual}
                rol={rol}
                proveedor={proveedor}
                cargaActual={cargaActual}
              />
            }
          />
          <Route
            path="/proveedor"
            element={
              <ProtectedRoute>
                <Proveedor setProveedor={setProveedor} rol={rol} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carga"
            element={
              <ProtectedRoute>
                <Carga
                  cargas={cargas}
                  setCargas={updateCargas}
                  rol={rol}
                  proveedor={proveedor}
                  cargaActual={cargaActual}
                  setCargaActual={setCargaActual}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pesaje1"
            element={
              <ProtectedRoute>
                <ControlPesaje
                  cargas={cargas}
                  setCargas={updateCargas}
                  proveedor={proveedor}
                  cargaActual={cargaActual}
                  setCargaActual={setCargaActual}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pesaje2"
            element={
              <ProtectedRoute>
                <ControlPesaje2
                  cargas={cargas}
                  setCargas={updateCargas}
                  proveedor={proveedor}
                  cargaActual={cargaActual}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pesaje3"
            element={
              <ProtectedRoute>
                <ControlPesaje3
                  cargas={cargas}
                  setCargas={updateCargas}
                  proveedor={proveedor}
                  cargaActual={cargaActual}
                  setCargaActual={setCargaActual}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cc1"
            element={
              <ProtectedRoute>
                <ControlCalidad1
                  cargas={cargas}
                  setCargas={updateCargas}
                  proveedor={proveedor}
                  cargaActual={cargaActual}
                  setCargaActual={setCargaActual}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cc2"
            element={
              <ProtectedRoute>
                <ControlCalidad2
                  cargas={cargas}
                  proveedor={proveedor}
                  cargaActual={cargaActual}
                  setCargaActual={setCargaActual}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cc3"
            element={
              <ProtectedRoute>
                <ControlCalidad3
                  cargas={cargas}
                  setCargas={updateCargas}
                  proveedor={proveedor}
                  cargaActual={cargaActual}
                  setCargaActual={setCargaActual}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cc4"
            element={
              <ProtectedRoute>
                <ControlCalidad4
                  cargas={cargas}
                  setCargas={updateCargas}
                  proveedor={proveedor}
                  cargaActual={cargaActual}
                  setCargaActual={setCargaActual}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/datosg1"
            element={
              <ProtectedRoute>
                <DatosG1
                  cargaActual={cargaActual}
                  setCargaActual={setCargaActual}
                  proveedor={proveedor}
                  cargas={cargas}
                  setCargas={updateCargas}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/datosg2"
            element={
              <ProtectedRoute>
                <DatosG2
                  cargaActual={cargaActual}
                  proveedor={proveedor}
                  cargas={cargas}
                  setCargas={updateCargas}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/datosg3"
            element={
              <ProtectedRoute>
                <DatosG3
                  cargaActual={cargaActual}
                  proveedor={proveedor}
                  cargas={cargas}
                  setCargas={updateCargas}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/datosg4"
            element={
              <ProtectedRoute>
                <DatosG4
                  cargaActual={cargaActual}
                  proveedor={proveedor}
                  cargas={cargas}
                  setCargas={updateCargas}
                  guias_precintos={guias_precintos}
                  setGuias_precintos={setGuias_precintos}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revisionguias"
            element={
              <ProtectedRoute>
                <RevisionGuias
                  cargas={cargas}
                  proveedor={proveedor}
                  cargaActual={cargaActual}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/formulariosguia"
            element={
              <ProtectedRoute>
                <FormulariosGuia
                  cargaActual={cargaActual}
                  setCargaActual={setCargaActual}
                  proveedor={proveedor}
                  cargas={cargas}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sist1"
            element={
              <ProtectedRoute>
                <Sistemas1
                  cargaActual={cargaActual}
                  setCargaActual={setCargaActual}
                  proveedor={proveedor}
                  cargas={cargas}
                  setCargas={updateCargas}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sist2"
            element={
              <ProtectedRoute>
                <Sistemas2
                  cargaActual={cargaActual}
                  proveedor={proveedor}
                  cargas={cargas}
                  setCargas={updateCargas}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/underconstruction" element={<UnderConstruction />} />
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
        <footer>Creado por ©iamp15 2024. Todos los derechos reservados.</footer>
      </div>
    </>
  );
}

export default App;
