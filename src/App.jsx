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
import { useAlert } from "./components/alert/AlertContext";
import Sistemas1 from "./components/sistemas/Sistemas1";
import Sistemas2 from "./components/sistemas/Sistemas2";
import Distribucion from "./components/formatos/Distribucion";
import SelectorFormatos from "./components/formatos/SelectorFormatos";
import MenuConfiguracion from "./components/configuracion/MenuConfiguracion";
import LogViewer from "./components/configuracion/logs/LogViewer";
import { saveLog } from "./utils/LogSystem";
import { getCurrentTime } from "./utils/TimeUtils";
import { PROVIDER_MAP_REVERSE } from "./constants/constants";

function App() {
  const [rol, setRol] = useState(() => {
    const savedRol = sessionStorage.getItem("rol");
    return savedRol ? savedRol : "";
  });
  const [proveedor, setProveedor] = useState(() => {
    const savedProveedor = sessionStorage.getItem("proveedor");
    return savedProveedor ? savedProveedor : "";
  });
  const today = formatDate2();
  const [cargas, setCargas] = useState({
    version: "1",
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
  const time = getCurrentTime();
  const docRef = doc(db, "cargas", today);
  const { addAlert } = useAlert();

  useEffect(() => {
    if (!currentUser) return; // Don't set up listener if not authenticated

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const firestoreCargas = snapshot.data();

        if (firestoreCargas.version > cargas.version) {
          const mergedCargas = { ...cargas };

          // Merge local and Firestore data
          Object.keys(firestoreCargas).forEach((key) => {
            if (Array.isArray(firestoreCargas[key])) {
              mergedCargas[key] = firestoreCargas[key].map((item, index) => {
                if (mergedCargas[key][index]) {
                  const localItem = mergedCargas[key][index];

                  // Compare all fields in the nested object, excluding specific fields
                  for (const field of Object.keys(item)) {
                    if (
                      field !== "editHistory" && // Exclude "editHistory"
                      field !== "tk" && // Exclude "tk"
                      field !== "paletas" && // Exclude "paletas"
                      field !== "paredes" && // Exclude "paredes"
                      field !== "olor" && // Exclude "olor"
                      field !== "cnd" && // Exclude "cnd"
                      field !== "muestras" && // Exclude "muestras"
                      field !== "temperaturas" && // Exclude "temperaturas"
                      field !== "pesos" && // Exclude "pesos"
                      field !== "codigos_guias" && // Exclude "codigos_guias"
                      field !== "pesos_guias" && // Exclude "pesos_guias"
                      field !== "precintos" && // Exclude "precintos"
                      item[field] &&
                      localItem[field]
                    ) {
                      // Skip prompt if old data equals new data
                      if (item[field] === localItem[field]) {
                        continue;
                      }

                      const message = `Ya existe información para el campo [${field}]. ¿Deseas sustituir "${localItem[field]}" por "${item[field]}"?`;
                      const overwrite = window.confirm(message);
                      if (!overwrite) {
                        return localItem; // Keep local data if user chooses not to overwrite
                      }
                    }
                  }
                  return item; // Overwrite with new data if no conflicts or user agrees
                }
                return item; // Add new item if no local data exists
              });
            } else {
              mergedCargas[key] = firestoreCargas[key];
            }
          });

          setCargas(mergedCargas);
          saveLog(
            `Merged local cargas with Firestore version ${firestoreCargas.version}`
          );
        }
      } else {
        // Only set the document if local cargas state is empty
        if (
          cargas.tr.length === 0 &&
          cargas.tg.length === 0 &&
          cargas.al.length === 0 &&
          cargas.av.length === 0 &&
          cargas.an.length === 0
        ) {
          setDoc(docRef, cargas);
          saveLog(`Write to Firestore: Created new cargas at ${time}`);
        }
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [currentUser, cargas]);

  const checkOnlineStatus = () => {
    saveLog(`Checking online status at ${time}: ${navigator.onLine}`);
    return navigator.onLine;
  };

  const updateCargas = async (newCargas) => {
    if (!currentUser) return; // Don't attempt update if not authenticated

    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      saveLog(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }

    // If newCargas is a function, execute it to get the new state
    const updatedCargas =
      typeof newCargas === "function" ? newCargas(cargas) : newCargas;

    // Increment the version number
    const updatedCargasWithVersion = {
      ...updatedCargas,
      version: parseInt(updatedCargas.version) + 1,
    };

    const saveToFirestore = async (data, retries = 3) => {
      try {
        await setDoc(doc(db, "cargas", today), data);
        saveLog(`Write to Firestore: Updated cargas version ${data.version}`);
        console.log("Cargas updated!");
        setCargas(data);
      } catch (error) {
        if (retries > 0) {
          saveLog(`Retrying to update cargas: ${retries} attempts left`);
          console.error("Error updating cargas:", error);
          setTimeout(() => saveToFirestore(data, retries - 1), 1000);
          addAlert("Hubo un error al guardar la información", "error");
        } else {
          saveLog(`Error updating cargas: ${error}`, "error");
          console.error("Error updating cargas:", error);
          addAlert("Hubo un error al guardar la información", "error");
        }
      }
    };
    saveToFirestore(updatedCargasWithVersion);
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
          <Route path="/distribucion" element={<Distribucion />} />
          <Route path="/underconstruction" element={<UnderConstruction />} />
          <Route path="*" element={<h1>Not Found</h1>} />
          <Route path="/selectorformatos" element={<SelectorFormatos />} />
          <Route
            path="/menuConfiguracion"
            element={
              <ProtectedRoute>
                <MenuConfiguracion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logviewer"
            element={
              <ProtectedRoute>
                <LogViewer />
              </ProtectedRoute>
            }
          />
        </Routes>
        <footer>Creado por ©iamp15 2024. Todos los derechos reservados.</footer>
      </div>
    </>
  );
}

export default App;
