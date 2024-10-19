import { useState, useEffect } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import ControlPesaje from "./components/controlPesaje/ControlPesaje";
import ControlCalidad from "./components/controlCalidad/ControlCalidad";
import Carga from "./components/Carga";
import { Rol } from "./components/Rol";
import DatosG1 from "./components/guias/chofer-vehiculo/DatosG1";
import Proveedor from "./components/Proveedor";
import DatosG2 from "./components/guias/distribuidora/DatosG2";
import DatosG3 from "./components/guias/controles/DatosG3";
import DatosG4 from "./components/guias/guias/DatosG4";
import RevisionGuias from "./components/guias/RevisionGuias";
import FormulariosGuia from "./components/guias/FormulariosGuia";
import Navbar from "./components/Navbar";

function App() {
  const [rol, setRol] = useState(() => {
    const savedRol = sessionStorage.getItem("rol");
    return savedRol ? savedRol : "";
  });
  const [proveedor, setProveedor] = useState(() => {
    const savedProveedor = sessionStorage.getItem("proveedor");
    return savedProveedor ? savedProveedor : "";
  });
  const [cargas, setCargas] = useState(() => {
    // Initialize cargas from sessionStorage or use default value
    const savedCargas = sessionStorage.getItem("cargas");
    return savedCargas
      ? JSON.parse(savedCargas)
      : {
          tr: [],
          tg: [],
          al: [],
          av: [],
        };
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

  // Save cargas to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("cargas", JSON.stringify(cargas));
  }, [cargas]);

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
          <Route path="/" element={<Rol setRol={setRol} />} />
          <Route
            path="/proveedor"
            element={
              <Proveedor
                proveedor={proveedor}
                setProveedor={setProveedor}
                rol={rol}
              />
            }
          />
          <Route
            path="/carga"
            element={
              <Carga
                cargas={cargas}
                setCargas={setCargas}
                rol={rol}
                proveedor={proveedor}
                cargaActual={cargaActual}
                setCargaActual={setCargaActual}
              />
            }
          />
          <Route path="/cp" element={<ControlPesaje />} />
          <Route path="/cc" element={<ControlCalidad />} />
          <Route
            path="/datosg1"
            element={
              <DatosG1
                cargaActual={cargaActual}
                setCargaActual={setCargaActual}
                proveedor={proveedor}
                cargas={cargas}
                setCargas={setCargas}
              />
            }
          />
          <Route
            path="/datosg2"
            element={
              <DatosG2
                cargaActual={cargaActual}
                proveedor={proveedor}
                cargas={cargas}
                setCargas={setCargas}
              />
            }
          />
          <Route
            path="/datosg3"
            element={
              <DatosG3
                cargaActual={cargaActual}
                proveedor={proveedor}
                cargas={cargas}
                setCargas={setCargas}
              />
            }
          />
          <Route
            path="/datosg4"
            element={
              <DatosG4
                cargaActual={cargaActual}
                proveedor={proveedor}
                cargas={cargas}
                setCargas={setCargas}
                guias_precintos={guias_precintos}
                setGuias_precintos={setGuias_precintos}
              />
            }
          />
          <Route
            path="/revisionguias"
            element={
              <RevisionGuias
                cargas={cargas}
                proveedor={proveedor}
                cargaActual={cargaActual}
              />
            }
          />
          <Route
            path="/formulariosguia"
            element={
              <FormulariosGuia
                cargaActual={cargaActual}
                setCargaActual={setCargaActual}
                proveedor={proveedor}
                cargas={cargas}
              />
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
