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

function App() {
  const [rol, setRol] = useState(() => {
    const savedRol = localStorage.getItem("rol");
    return savedRol ? savedRol : "";
  });
  const [proveedor, setProveedor] = useState(() => {
    const savedProveedor = localStorage.getItem("proveedor");
    return savedProveedor ? savedProveedor : "";
  });
  const [cargas, setCargas] = useState({
    tr: [],
    tg: [],
    al: [],
    av: [],
  });
  const [cargaActual, setCargaActual] = useState(() => {
    // Initialize cargaActual from localStorage or use default value
    const savedCargaActual = localStorage.getItem("cargaActual");
    return savedCargaActual ? parseInt(savedCargaActual) : 0;
  });
  const [guias_precintos, setGuias_precintos] = useState(() => {
    const savedGuias_precintos = localStorage.getItem("guias_precintos");
    return savedGuias_precintos
      ? JSON.parse(savedGuias_precintos)
      : {
          guias: "",
          precintos: "",
        };
  });

  // useEffect(() => {
  //   // Set up real-time listener
  //   const unsubscribe = onSnapshot(doc(db, "estados", "cargas"), (doc) => {
  //     if (doc.exists()) {
  //       setCargas(doc.data());
  //     } else {
  //       // If document doesn't exist, create it with initial state
  //       setDoc(doc(db, "estados", "cargas"), cargas);
  //     }
  //   });

  //   // Cleanup subscription
  //   return () => unsubscribe();
  // }, []);

  // const updateCargas = async (newCargas) => {
  //   try {
  //     await setDoc(doc(db, "estados", "cargas"), newCargas);
  //     setCargas(newCargas);
  //   } catch (error) {
  //     console.error("Error updating cargas:", error);
  //     // Handle error appropriately
  //   }
  // };

  // Save cargaActual to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cargaActual", cargaActual.toString());
  }, [cargaActual]);

  useEffect(() => {
    localStorage.setItem("rol", rol);
  }, [rol]);

  useEffect(() => {
    localStorage.setItem("proveedor", proveedor);
  }, [proveedor]);

  useEffect(() => {
    localStorage.setItem("guias_precintos", JSON.stringify(guias_precintos));
  }, [guias_precintos]);

  console.log(cargas);

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
                setCargas={setCargas}
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
                  setCargas={setCargas}
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
                  setCargas={setCargas}
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
                  setCargas={setCargas}
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
                  setCargas={setCargas}
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
                  setCargas={setCargas}
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
                  setCargas={setCargas}
                  proveedor={proveedor}
                  cargaActual={cargaActual}
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
                  setCargas={setCargas}
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
                  setCargas={setCargas}
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
                  setCargas={setCargas}
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
                  setCargas={setCargas}
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
                  setCargas={setCargas}
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
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
        <footer>Creado por ©iamp15 2024. Todos los derechos reservados.</footer>
      </div>
    </>
  );
}

export default App;
