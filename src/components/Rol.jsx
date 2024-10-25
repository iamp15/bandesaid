/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import "./../styles/Rol.css";
import { useEffect, useState } from "react";

export const Rol = ({
  setRol,
  cargas,
  setCargas,
  setProveedor,
  setCargaActual,
  rol,
  proveedor,
  cargaActual,
}) => {
  const [hasPreviousInfo, setHasPreviousInfo] = useState(false);
  const [showClearedMessage, setShowClearedMessage] = useState(false);

  const hasAnyInfo = (cargas, rol, proveedor, cargaActual) => {
    // Check for any provider info
    const hasProviderInfo = (() => {
      const providers = ["tr", "tg", "al", "av"];

      return providers.some((provider) => {
        const providerData = cargas[provider];

        if (!providerData) return false;

        return Object.values(providerData).some((value) => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          if (typeof value === "object" && value !== null) {
            return Object.keys(value).length > 0;
          }
          return value !== null && value !== undefined && value !== "";
        });
      });
    })();

    // Check for rol, proveedor, and cargaActual
    const hasRol = rol !== "" && rol !== undefined && rol !== null;
    const hasProveedor =
      proveedor !== "" && proveedor !== undefined && proveedor !== null;
    const hasCargaActual =
      cargaActual !== 0 && cargaActual !== undefined && cargaActual !== null;

    // Return true if any of the checks are true
    return hasProviderInfo || hasRol || hasProveedor || hasCargaActual;
  };

  useEffect(() => {
    setHasPreviousInfo(hasAnyInfo(cargas, rol, proveedor, cargaActual));
  }, [cargas, rol, proveedor, cargaActual]);

  const handleClearInfo = () => {
    // Show a confirmation dialog
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas borrar toda la información guardada? Esta acción no se puede deshacer."
    );

    if (isConfirmed) {
      // Clear the cargas state
      setCargas({
        tr: [],
        tg: [],
        al: [],
        av: [],
      });

      // Clear localStorage
      setHasPreviousInfo(false);

      //clear rol
      setRol("");

      //clear proveedor
      setProveedor("");

      //clear carga actual
      setCargaActual(0);

      // Show the cleared message
      setShowClearedMessage(true);

      localStorage.clear();

      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowClearedMessage(false);
      }, 3000);
    }
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Escoge tu rol:</h2>
        <div className="buttons-container">
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
        </div>
        {hasPreviousInfo && (
          <div className="previous-info-message">
            <p>
              <span className="warning-icon">
                ⚠️ Existe información previa guardada.
              </span>
            </p>
            <button onClick={handleClearInfo}>
              Limpiar información previa
            </button>
          </div>
        )}
        {showClearedMessage && (
          <div className="cleared-message">
            Información previa borrada exitosamente
          </div>
        )}
        <div className="button-group">
          <Link to={"/"}>
            <button>Volver a inicio</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
