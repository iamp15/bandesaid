import { createContext, useState, useEffect, useContext } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  runTransaction,
  query,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { formatDate2 } from "../utils/FormatDate";
import { PROVIDER_MAP, PLANTAS, PLANTA_DEFAULT } from "../constants/constants";
// Funciones de Firestore para choferes y camiones
import {
  subscribeToChoferes,
  addChofer as addChoferToFirestore,
  updateChofer as updateChoferInFirestore,
  deleteChofer as deleteChoferFromFirestore,
} from "../firebase/choferes";
import {
  subscribeToCamiones,
  addCamion as addCamionToFirestore,
  updateCamion as updateCamionInFirestore,
  deleteCamion as deleteCamionFromFirestore,
} from "../firebase/camiones";

const PROVIDERS = ["tr", "tg", "al", "av", "an"];
const APP_DATE_STORAGE_KEY = "appDate";
const VOLATILE_STORAGE_KEYS = [
  "cargaActual",
  "proveedor",
  "rol",
  "guias_precintos",
];
const DATE_CHECK_INTERVAL_MS = 60 * 1000;
const DEFAULT_GUIAS_PRECINTOS = {
  guias: "",
  precintos: "",
};

const createProviderMap = (createValue) =>
  PROVIDERS.reduce((acc, provider) => {
    acc[provider] = createValue(provider);
    return acc;
  }, {});

const syncAppDate = () => {
  const currentDate = formatDate2();
  const savedDate = localStorage.getItem(APP_DATE_STORAGE_KEY);

  if (savedDate && savedDate !== currentDate) {
    VOLATILE_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  if (savedDate !== currentDate) {
    localStorage.setItem(APP_DATE_STORAGE_KEY, currentDate);
  }

  return currentDate;
};

export const EstadosContext = createContext();

export function useEstados() {
  return useContext(EstadosContext);
}

// eslint-disable-next-line react/prop-types
export const EstadosProvider = ({ children }) => {
  const todayId = syncAppDate();
  const [cargas, setCargas] = useState({
    id: todayId,
    tr: [],
    tg: [],
    al: [],
    av: [],
    an: [],
  });
  const providers = PROVIDERS;
  const [currentCarga, setCurrentCarga] = useState({});
  const [cargaActual, setCargaActual] = useState(() => {
    // Guarda el ID del documento de Firestore, no el numero visible de carga.
    const savedCargaActual = localStorage.getItem("cargaActual");
    return savedCargaActual && savedCargaActual !== "0" ? savedCargaActual : "";
  });
  const [proveedor, setProveedor] = useState(() => {
    const savedProveedor = localStorage.getItem("proveedor");
    return savedProveedor ? savedProveedor : "";
  });

  const [planta, setPlanta] = useState(() => {
    const savedPlanta = localStorage.getItem("planta");
    return savedPlanta || PLANTA_DEFAULT;
  });

  const plantaConfig = PLANTAS[planta] || PLANTAS[PLANTA_DEFAULT];

  // Estados para manejo de conectividad y sincronización
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({
    isConnected: false,
    lastSync: null,
    hasInitialData: false,
    isStale: false,
    pendingOperations: 0,
  });
  // Indica qué proveedores ya recibieron al menos un snapshot (evita mostrar lista vacía antes de que lleguen datos)
  const [providerSnapshotReceived, setProviderSnapshotReceived] = useState(() =>
    createProviderMap(() => false)
  );
  const [providerSyncStatus, setProviderSyncStatus] = useState(() =>
    createProviderMap(() => ({
      fromCache: false,
      hasPendingWrites: false,
    }))
  );

  // Estados para catálogo de choferes (global)
  const [choferes, setChoferes] = useState([]);
  const [choferesLoaded, setChoferesLoaded] = useState(false);

  // Estados para catálogo de camiones (global)
  const [camiones, setCamiones] = useState([]);
  const [camionesLoaded, setCamionesLoaded] = useState(false);

  // Monitor de conectividad
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus((prev) => ({ ...prev, isConnected: true }));
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus((prev) => ({ ...prev, isConnected: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const statuses = Object.values(providerSyncStatus);
    const isStale = statuses.some((status) => status.fromCache);
    const pendingOperations = statuses.filter(
      (status) => status.hasPendingWrites
    ).length;

    setSyncStatus((prev) => ({
      ...prev,
      isStale,
      pendingOperations,
      isConnected: isStale ? false : prev.isConnected,
    }));
  }, [providerSyncStatus]);

  // Subscribe a cambios en tiempo real de la colección de choferes
  useEffect(() => {
    let loaded = false;
    
    // Timeout de seguridad: si no hay datos en 5 segundos, mostrar interfaz vacía
    const timeoutId = setTimeout(() => {
      if (!loaded) {
        console.log("Timeout: No se recibieron datos de choferes, mostrando interfaz vacía");
        setChoferesLoaded(true);
      }
    }, 5000);

    const unsubscribe = subscribeToChoferes((choferesData) => {
      loaded = true;
      clearTimeout(timeoutId);
      setChoferes(choferesData);
      setChoferesLoaded(true);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // Subscribe a cambios en tiempo real de la colección de camiones
  useEffect(() => {
    let loaded = false;
    
    // Timeout de seguridad: si no hay datos en 5 segundos, mostrar interfaz vacía
    const timeoutId = setTimeout(() => {
      if (!loaded) {
        console.log("Timeout: No se recibieron datos de camiones, mostrando interfaz vacía");
        setCamionesLoaded(true);
      }
    }, 5000);

    const unsubscribe = subscribeToCamiones((camionesData) => {
      loaded = true;
      clearTimeout(timeoutId);
      setCamiones(camionesData);
      setCamionesLoaded(true);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // Fetch cargas from all provider subcollections for today and current plant (real-time)
  useEffect(() => {
    const unsubscribes = [];
    const loadedProviders = new Set();
    const totalProviders = providers.length;

    setCargas((prevCargas) => ({
      ...prevCargas,
      ...createProviderMap(() => []),
    }));
    setProviderSnapshotReceived(createProviderMap(() => false));
    setProviderSyncStatus(
      createProviderMap(() => ({
        fromCache: false,
        hasPendingWrites: false,
      }))
    );
    setSyncStatus((prev) => ({
      ...prev,
      hasInitialData: false,
      isStale: false,
      pendingOperations: 0,
    }));

    providers.forEach((prov) => {
      const provColRef = collection(db, "cargas", todayId, "plantas", planta, prov);
      const unsubscribe = onSnapshot(
        provColRef,
        { includeMetadataChanges: true },
        (provSnap) => {
          const fromCache = provSnap.metadata.fromCache;
          const hasPendingWrites = provSnap.metadata.hasPendingWrites;

          setProviderSyncStatus((prev) => ({
            ...prev,
            [prov]: {
              fromCache,
              hasPendingWrites,
            },
          }));

          if (!fromCache) {
            setSyncStatus((prev) => ({
              ...prev,
              lastSync: new Date(),
              isConnected: true,
            }));
          }

          setCargas((prevCargas) => ({
            ...prevCargas,
            [prov]: provSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })),
          }));

          // Marcar que este proveedor ya recibió al menos un snapshot (para que la página de cargas no muestre 0 hasta que lleguen datos)
          setProviderSnapshotReceived((prev) => ({ ...prev, [prov]: true }));

          // Track initial data load - only count each provider once
          if (!loadedProviders.has(prov)) {
            loadedProviders.add(prov);
            if (loadedProviders.size >= totalProviders) {
              setSyncStatus((prev) => ({
                ...prev,
                hasInitialData: true,
                lastSync: new Date(),
                isConnected: true,
              }));
            }
          } else {
            // Update sync status for subsequent updates
            setSyncStatus((prev) => ({
              ...prev,
              lastSync: new Date(),
              isConnected: true,
            }));
          }
        },
        (error) => {
          console.error(`Error syncing ${prov} cargas:`, error);
          setSyncStatus((prev) => ({
            ...prev,
            isConnected: false,
            isStale: true,
            lastSync: prev.lastSync, // Keep last successful sync time
          }));
        }
      );
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [todayId, planta]);

  useEffect(() => {
    const key_prov = PROVIDER_MAP[proveedor];
    const providerCargas = cargas[key_prov] || [];
    const carga = providerCargas.find((c) => c.id === cargaActual);

    if (carga) {
      setCurrentCarga(carga);
      return;
    }

    // Migra una seleccion vieja guardada como numero visible, solo si no es ambigua.
    const legacyCargaNumber = Number(cargaActual);
    if (cargaActual && Number.isFinite(legacyCargaNumber)) {
      const legacyMatches = providerCargas.filter(
        (c) => c.cargaNumber === legacyCargaNumber
      );

      if (legacyMatches.length === 1) {
        setCargaActual(legacyMatches[0].id);
        setCurrentCarga(legacyMatches[0]);
        return;
      }
    }

    setCurrentCarga({});
  }, [cargas, cargaActual, proveedor]);

  // Add a new carga for a provider with simple consecutive numbering.
  // Uses a Firestore transaction so the next number is assigned atomically and
  // two devices creating at the same time cannot get the same number.
  const addCarga = async (provider, cargaData) => {
    const { auth } = await import("../firebase/config");
    const currentAuthUser = auth.currentUser;

    if (!currentAuthUser) {
      throw new Error(
        "Usuario no autenticado. Por favor, inicia sesión nuevamente."
      );
    }

    console.log(
      "Creating carga with authenticated user:",
      currentAuthUser.email
    );

    const provColRef = collection(db, "cargas", todayId, "plantas", planta, provider);
    // Contador atómico por proveedor y planta
    const counterRef = doc(db, "cargas", todayId, "plantas", planta, "_counters", provider);
    const counterNotInitializedError = "COUNTER_NOT_INITIALIZED";

    const createCargaWithCounter = async (fallbackCargaNumber) => runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);
      let newCargaNumber;

      if (counterSnap.exists()) {
        newCargaNumber = counterSnap.data().nextCargaNumber ?? 1;
      } else if (typeof fallbackCargaNumber === "number") {
        newCargaNumber = fallbackCargaNumber;
      } else {
        throw new Error(counterNotInitializedError);
      }

      transaction.set(counterRef, {
        nextCargaNumber: newCargaNumber + 1,
      });

      console.log(`Creating carga #${newCargaNumber} for provider ${provider}`);

      const newDocRef = doc(provColRef);
      transaction.set(newDocRef, {
        ...cargaData,
        cargaNumber: newCargaNumber,
        createdBy: currentAuthUser.email,
        createdAt: new Date().toISOString(),
      });
    });

    try {
      await createCargaWithCounter();
    } catch (error) {
      if (error.message !== counterNotInitializedError) {
        throw error;
      }

      const existingSnap = await getDocs(provColRef);
      const maxCargaNumber = existingSnap.docs.reduce((max, cargaDoc) => {
        const n = cargaDoc.data().cargaNumber;
        return typeof n === "number" && n > max ? n : max;
      }, 0);

      await createCargaWithCounter(maxCargaNumber + 1);
    }
    // Do not update local state here; onSnapshot will update the UI
  };

  // Update specific fields of a carga (field-level update)
  const updateCargaField = async (provider, cargaId, updatedFields) => {
    console.log(
      `Updating carga ${cargaId} for provider ${provider} with fields:`,
      updatedFields
    );
    const cargaDocRef = doc(db, "cargas", todayId, "plantas", planta, provider, cargaId);
    await updateDoc(cargaDocRef, updatedFields);
    // Do not update local state here; let onSnapshot handle it
  };

  // Delete a carga and rewind the counter only when deleting the latest carga.
  const deleteCarga = async (provider, cargaId) => {
    try {
      const cargaDocRef = doc(db, "cargas", todayId, "plantas", planta, provider, cargaId);
      const counterRef = doc(db, "cargas", todayId, "plantas", planta, "_counters", provider);

      await runTransaction(db, async (transaction) => {
        const cargaSnap = await transaction.get(cargaDocRef);

        if (!cargaSnap.exists()) {
          throw new Error("La carga que intentas eliminar ya no existe.");
        }

        const cargaNumber = cargaSnap.data().cargaNumber;
        const counterSnap = await transaction.get(counterRef);

        if (counterSnap.exists() && typeof cargaNumber === "number") {
          const nextCargaNumber = counterSnap.data().nextCargaNumber;
          const lastCargaNumber =
            typeof nextCargaNumber === "number" ? nextCargaNumber - 1 : null;

          if (cargaNumber === lastCargaNumber) {
            transaction.update(counterRef, {
              nextCargaNumber: Math.max(1, nextCargaNumber - 1),
            });
          }
        }

        transaction.delete(cargaDocRef);
      });
      // Do not update local state here; let onSnapshot handle it
    } catch (error) {
      console.error("Error deleting carga:", error);
      throw error;
    }
  };

  // ==================== FUNCIONES PARA CHOFERES ====================

  /**
   * Agregar un nuevo chofer al catálogo global
   * @param {Object} choferData - Datos del chofer { nombre, cedula }
   * @returns {Promise<string>} ID del chofer creado
   */
  const addChofer = async (choferData) => {
    return await addChoferToFirestore(choferData);
  };

  /**
   * Actualizar un chofer existente
   * @param {string} choferId - ID del chofer
   * @param {Object} choferData - Datos actualizados { nombre, cedula }
   */
  const updateChofer = async (choferId, choferData) => {
    return await updateChoferInFirestore(choferId, choferData);
  };

  /**
   * Eliminar un chofer del catálogo
   * @param {string} choferId - ID del chofer a eliminar
   */
  const deleteChofer = async (choferId) => {
    return await deleteChoferFromFirestore(choferId);
  };

  // ==================== FUNCIONES PARA CAMIONES ====================

  /**
   * Agregar un nuevo camión al catálogo global
   * @param {Object} camionData - Datos del camión { placa, marca }
   * @returns {Promise<string>} ID del camión creado
   */
  const addCamion = async (camionData) => {
    return await addCamionToFirestore(camionData);
  };

  /**
   * Actualizar un camión existente
   * @param {string} camionId - ID del camión
   * @param {Object} camionData - Datos actualizados { placa, marca }
   */
  const updateCamion = async (camionId, camionData) => {
    return await updateCamionInFirestore(camionId, camionData);
  };

  /**
   * Eliminar un camión del catálogo
   * @param {string} camionId - ID del camión a eliminar
   */
  const deleteCamion = async (camionId) => {
    return await deleteCamionFromFirestore(camionId);
  };

  const [rol, setRol] = useState(() => {
    const savedRol = localStorage.getItem("rol");
    return savedRol ? savedRol : "";
  });

  const [guias_precintos, setGuias_precintos] = useState(() => {
    const savedGuias_precintos = localStorage.getItem("guias_precintos");
    return savedGuias_precintos
      ? JSON.parse(savedGuias_precintos)
      : { ...DEFAULT_GUIAS_PRECINTOS };
  });

  useEffect(() => {
    const resetVolatileStateIfDateChanged = () => {
      const savedDate = localStorage.getItem(APP_DATE_STORAGE_KEY);
      const currentDate = formatDate2();

      if (savedDate === currentDate) return;

      syncAppDate();
      setCargaActual("");
      setProveedor("");
      setRol("");
      setGuias_precintos({ ...DEFAULT_GUIAS_PRECINTOS });
      setCurrentCarga({});
    };

    const intervalId = setInterval(
      resetVolatileStateIfDateChanged,
      DATE_CHECK_INTERVAL_MS
    );

    return () => clearInterval(intervalId);
  }, []);

  // Save cargaActual to sessionStorage whenever it changes
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
    localStorage.setItem("planta", planta);
  }, [planta]);

  useEffect(() => {
    localStorage.setItem("guias_precintos", JSON.stringify(guias_precintos));
  }, [guias_precintos]);

  const values = {
    cargas,
    setCargas, // Optional: you may want to restrict direct usage
    addCarga,
    updateCargaField,
    deleteCarga,
    cargaActual,
    setCargaActual,
    currentCarga,
    rol,
    setRol,
    proveedor,
    setProveedor,
    planta,
    setPlanta,
    plantaConfig,
    guias_precintos,
    setGuias_precintos,
    // Estados de conectividad
    isOnline,
    syncStatus,
    providerSnapshotReceived,
    providerSyncStatus,
    // Catálogo de choferes (global)
    choferes,
    choferesLoaded,
    addChofer,
    updateChofer,
    deleteChofer,
    // Catálogo de camiones (global)
    camiones,
    camionesLoaded,
    addCamion,
    updateCamion,
    deleteCamion,
  };

  return (
    <EstadosContext.Provider value={values}>{children}</EstadosContext.Provider>
  );
};
