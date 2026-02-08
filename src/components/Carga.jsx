import { useState, useEffect, useMemo } from "react";
import CuadroCargas from "./CuadroCargas";
import { formatDate } from "../utils/FormatDate";
import { useAlert } from "./alert/AlertContext";
import { useAuth } from "./login/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { saveLog } from "../utils/LogSystem";
import { PROVIDER_MAP } from "../constants/constants";
import { useEstados } from "../contexts/EstadosContext";

const Carga = () => {
  const {
    cargas,
    addCarga,
    deleteCarga,
    proveedor,
    setCargas,
    isOnline,
    syncStatus,
    providerSnapshotReceived,
  } = useEstados();
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
  const [addDisabled, setAddDisabled] = useState(false);
  const [lastAddTime, setLastAddTime] = useState(0);

  // Cargas están "cargadas" solo cuando Firestore ha enviado al menos un snapshot para este proveedor
  // (el estado inicial tiene arrays vacíos, por eso no se puede usar solo Array.isArray(cargas[key]))
  const cargasLoading = !providerSnapshotReceived[key];
  // Show spinner for a short time on first mount to avoid flash of empty content
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Sort providerCargas by cargaNumber before rendering
  const providerCargas = useMemo(() => {
    return (cargas[key] || [])
      .slice()
      .sort((a, b) => (a.cargaNumber || 0) - (b.cargaNumber || 0));
  }, [cargas, key]);

  // Mostrar loading solo para estados críticos
  if (loading || initialLoading) {
    return <LoadingSpinner />;
  }

  const checkOnlineStatus = () => {
    return navigator.onLine;
  };

  const handleAddCarga = async () => {
    const now = Date.now();
    if (addDisabled || now - lastAddTime < 2000) return;
    setAddDisabled(true);
    setLastAddTime(now);

    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      saveLog(
        `No hay conexión a internet. No se puede guardar la información.`,
        "error"
      );
      setAddDisabled(false);
      return;
    }

    try {
      await addCarga(key, newCargaData);
      // No actualización local - onSnapshot se encarga de actualizar la UI
    } catch (error) {
      addAlert("Error creando la carga. Intenta de nuevo.", "error");
      console.error("Error creating carga:", error);
    }

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

    setTimeout(() => setAddDisabled(false), 2000);
  };

  const handleDeleteCarga = async (cargaId) => {
    if (currentUser.name !== "Igor") {
      addAlert("No tienes permisos para eliminar cargas", "error");
      return;
    }

    // Find the carga to get its number
    const cargaToDelete = providerCargas.find((carga) => carga.id === cargaId);
    const cargaNumber = cargaToDelete ? cargaToDelete.cargaNumber : cargaId;

    askConfirmation(
      `¿Estás seguro de que deseas borrar la Carga #${cargaNumber}? Esta acción no se puede deshacer.`,
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
            saveLog(
              `Carga #${cargaNumber} (ID: ${cargaId}) deleted by ${currentUser.name}`
            );
            console.log(
              `Carga #${cargaNumber} deleted and logged successfully`
            );
            addAlert(`Carga #${cargaNumber} eliminada exitosamente`, "success");
          } catch (error) {
            console.error("Error logging carga deletion:", error);
            saveLog(
              `Error deleting carga #${cargaNumber} (ID: ${cargaId}): ${error.message}`,
              "error"
            );
            addAlert(
              `Error eliminando la Carga #${cargaNumber}. Intenta de nuevo.`,
              "error"
            );
          }
        }
      }
    );
  };

  return (
    <div className="wrap-container">
      {/* Indicador de conectividad */}
      {!isOnline && (
        <div
          style={{
            background: "#ff4444",
            color: "white",
            padding: "10px",
            textAlign: "center",
            marginBottom: "10px",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
        >
          ⚠️ Sin conexión a internet. Los datos pueden estar desactualizados.
        </div>
      )}

      {/* Indicador de operaciones pendientes */}
      {syncStatus.pendingOperations > 0 && (
        <div
          style={{
            background: "#ffa500",
            color: "white",
            padding: "8px",
            textAlign: "center",
            fontSize: "14px",
            marginBottom: "10px",
            borderRadius: "4px",
          }}
        >
          🔄 Sincronizando... ({syncStatus.pendingOperations} operaciones
          pendientes)
        </div>
      )}

      {/* Indicador de última sincronización */}
      {!isOnline && syncStatus.lastSync && (
        <div
          style={{
            background: "#666",
            color: "white",
            padding: "5px",
            textAlign: "center",
            fontSize: "12px",
            marginBottom: "10px",
            borderRadius: "4px",
          }}
        >
          Última sincronización:{" "}
          {syncStatus.lastSync.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

      <div className="menu">
        <div className="carga-container">
          <p>Cargas creadas de {proveedor}:</p>
          {cargasLoading ? (
            <p>Cargando cargas...</p>
          ) : providerCargas.length === 0 ? (
            <p>No hay cargas creadas</p>
          ) : (
            <CuadroCargas
              cargas={providerCargas}
              eliminarCarga={handleDeleteCarga}
            />
          )}
          {!loading && !cargasLoading && !initialLoading && (
            <button
              className="crear-carga-button"
              onClick={handleAddCarga}
              disabled={
                addDisabled || !isOnline || syncStatus.pendingOperations > 0
              }
              style={{
                opacity:
                  !isOnline || syncStatus.pendingOperations > 0 ? 0.5 : 1,
                cursor:
                  !isOnline || syncStatus.pendingOperations > 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {!isOnline
                ? "🔌 Sin conexión"
                : syncStatus.pendingOperations > 0
                ? "🔄 Sincronizando..."
                : "Crear nueva carga"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Carga;
