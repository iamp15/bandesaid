import { useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import ControlPesaje from "./components/controlPesaje/ControlPesaje";
import ControlCalidad from "./components/controlCalidad/ControlCalidad";
import Carga from "./components/Carga";
import { Rol } from "./components/Rol";
import DatosG1 from "./components/guias/DatosG1";
import Proveedor from "./components/Proveedor";
import DatosG2 from "./components/guias/DatosG2";
import DatosG3 from "./components/guias/DatosG3";
import DatosG4 from "./components/guias/DatosG4";
import RevisionGuias from "./components/guias/RevisionGuias";

function App() {
  const [rol, setRol] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [cargas, setCargas] = useState({
    tr: [],
    tg: [],
    al: [],
    av: [],
  });
  const [cargaActual, setCargaActual] = useState(0);
  const [guias_precintos, setGuias_precintos] = useState({
    guias: 0,
    precintos: 0,
  });
  const [infoCarga, setInfoCarga] = useState([
    {
      id: 1,
      proveedor: "Toro Rojo",
      galpon: "Súper Pollo Carrizal",
      rubro: "Pollo",
      montoGuia: "3.000,00",
      montoVerificado: "3.001,10",
      NumGuia: "154688856",
      marca: "San José",
      pesoProm: "2,02",
      tempProm: "-4,9",
      estadoDestino: "Distrito Capital",
      entidadDestino: "PDVAL Distrito Capital",
    },
  ]);

  console.log(cargas);

  return (
    <>
      <nav>
        {rol ? <a>{rol}</a> : "Bienvenido al sistema Bandes Aid"}
        {proveedor ? <a> - {proveedor}</a> : null}
        {cargaActual > 0 ? <a> - Carga #{cargaActual}</a> : null}
      </nav>
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
        <Route path="/revisionguias" element={<RevisionGuias />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;
