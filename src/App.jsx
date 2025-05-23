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
import LoginPage from "./components/login/LoginPage";
import ProtectedRoute from "./components/login/ProtectedRoute";
import UnderConstruction from "./components/UnderConstruction";
import Sistemas1 from "./components/sistemas/Sistemas1";
import Sistemas2 from "./components/sistemas/Sistemas2";
import Distribucion from "./components/formatos/Distribucion";
import SelectorFormatos from "./components/formatos/SelectorFormatos";
import MenuConfiguracion from "./components/configuracion/MenuConfiguracion";
import LogViewer from "./components/configuracion/logs/LogViewer";

function App() {
  return (
    <>
      <Navbar />
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
          <Route path="/despachos" element={<Rol />} />
          <Route
            path="/proveedor"
            element={
              <ProtectedRoute>
                <Proveedor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carga"
            element={
              <ProtectedRoute>
                <Carga />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pesaje1"
            element={
              <ProtectedRoute>
                <ControlPesaje />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pesaje2"
            element={
              <ProtectedRoute>
                <ControlPesaje2 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pesaje3"
            element={
              <ProtectedRoute>
                <ControlPesaje3 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cc1"
            element={
              <ProtectedRoute>
                <ControlCalidad1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cc2"
            element={
              <ProtectedRoute>
                <ControlCalidad2 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cc3"
            element={
              <ProtectedRoute>
                <ControlCalidad3 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cc4"
            element={
              <ProtectedRoute>
                <ControlCalidad4 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/datosg1"
            element={
              <ProtectedRoute>
                <DatosG1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/datosg2"
            element={
              <ProtectedRoute>
                <DatosG2 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/datosg3"
            element={
              <ProtectedRoute>
                <DatosG3 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/datosg4"
            element={
              <ProtectedRoute>
                <DatosG4 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revisionguias"
            element={
              <ProtectedRoute>
                <RevisionGuias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/formulariosguia"
            element={
              <ProtectedRoute>
                <FormulariosGuia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sist1"
            element={
              <ProtectedRoute>
                <Sistemas1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sist2"
            element={
              <ProtectedRoute>
                <Sistemas2 />
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
