/* eslint-disable react/prop-types */
import React, { useState } from "react";
import CuadroCargas from "./CuadroCargas";
import { formatDate } from "../utils/FormatDate";
import { useAlert } from "./alert/AlertContext";
import { useAuth } from "./login/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { saveLog } from "../utils/LogSystem";
import { PROVIDER_MAP } from "../constants/constants";
import { useEstados } from "../contexts/EstadosContext";

const Carga = () => {
  const { cargas, addCarga, deleteCarga, proveedor } = useEstados();
  const { askConfirmation, addAlert } = useAlert();
  const { currentUser, loading } = useAuth(); // Get current user
  const key = PROVIDER_MAP[proveedor];
  const [selectedCargaId, setSelectedCargaId] = useState(null);
  const [newCargaData, setNewCargaData] = useState({
    chofer: "",
    fecha: formatDate(),
    tk: "Si",
    paletas: "No",
    olor: "fresco",
    paredes: "1",
    puertaLateral: "No",
    marca_rubro: "San José",
    cnd: "072249161",
    lote: "N/A",
  });

  // Local loading state for cargas
  const [cargasLoading, setCargasLoading] = useState(true);
  // Show spinner for at least 2 seconds on mount
  const [initialLoading, setInitialLoading] = useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  // Watch cargas[key] and set loading to false when it is loaded
  React.useEffect(() => {
    if (Array.isArray(cargas[key])) {
      setCargasLoading(false);
    }
  }, [cargas, key]);

  if (loading || cargasLoading || initialLoading) return <LoadingSpinner />;

  const checkOnlineStatus = () => {
    return navigator.onLine;
  };

  const providerCargas = cargas[key] || [];

  const handleAddCarga = async () => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      saveLog(
        `No hay conexión a internet. No se puede guardar la información.`,
        "error"
      );
      return;
    }

    await addCarga(key, newCargaData);
    setNewCargaData({
      chofer: "",
      fecha: formatDate(),
      tk: "Si",
      paletas: "No",
      olor: "fresco",
      paredes: "1",
      puertaLateral: "No",
      marca_rubro: "San José",
      cnd: "072249161",
      lote: "N/A",
    });
  };

  const handleDeleteCarga = async (cargaId) => {
    if (currentUser.name !== "Igor") {
      addAlert("No tienes permisos para eliminar cargas", "error");
      return;
    }
    askConfirmation(
      `¿Estás seguro de que deseas borrar la carga ${cargaId}? Esta acción no se puede deshacer.`,
      async (isConfirmed) => {
        if (!checkOnlineStatus()) {
          addAlert(
            "No hay conexión a internet. No se puede guardar la información.",
            "error"
          );
          saveLog(
            `No hay conexión a internet. No se puede guardar la información.`,
            "error"
          );
          return;
        }

        if (key && isConfirmed) {
          try {
            await deleteCarga(key, cargaId);
            if (selectedCargaId === cargaId) setSelectedCargaId(null);
            saveLog(`Carga ${cargaId} deleted by ${currentUser.name}`);
            console.log(`Carga ${cargaId} deleted and logged successfully`);
          } catch (error) {
            console.error("Error logging carga deletion:", error);
            saveLog(
              `Error deleting carga ${cargaId}: ${error.message}`,
              "error"
            );
            // You might want to show an error message to the user here
          }
        }
      }
    );
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <div className="carga-container">
          <p>Cargas creadas de {proveedor}:</p>
          {cargasLoading ? null : providerCargas.length === 0 ? (
            <p>No hay cargas creadas</p>
          ) : (
            <CuadroCargas
              cargas={providerCargas}
              eliminarCarga={handleDeleteCarga}
            />
          )}
          {!loading && (
            <button className="crear-carga-button" onClick={handleAddCarga}>
              Crear nueva carga
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Carga;
