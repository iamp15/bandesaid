import { createContext, useState, useEffect, useContext } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  runTransaction,
  query,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { formatDate2 } from "../utils/FormatDate";
import { PROVIDER_MAP } from "../constants/constants";

export const EstadosContext = createContext();

export function useEstados() {
  return useContext(EstadosContext);
}

// eslint-disable-next-line react/prop-types
export const EstadosProvider = ({ children }) => {
  const [cargas, setCargas] = useState({
    id: formatDate2(),
    tr: [],
    tg: [],
    al: [],
    av: [],
    an: [],
  });
  const todayId = formatDate2();
  const providers = ["tr", "tg", "al", "av", "an"];
  const [currentCarga, setCurrentCarga] = useState({});
  const [cargaActual, setCargaActual] = useState(() => {
    // Initialize cargaActual from sessionStorage or use default value
    const savedCargaActual = localStorage.getItem("cargaActual");
    return savedCargaActual ? parseInt(savedCargaActual) : 0;
  });
  const [proveedor, setProveedor] = useState(() => {
    const savedProveedor = localStorage.getItem("proveedor");
    return savedProveedor ? savedProveedor : "";
  });

  // Estados para manejo de conectividad y sincronización
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({
    isConnected: false,
    lastSync: null,
    hasInitialData: false,
    pendingOperations: 0,
  });
  // Indica qué proveedores ya recibieron al menos un snapshot (evita mostrar lista vacía antes de que lleguen datos)
  const [providerSnapshotReceived, setProviderSnapshotReceived] = useState({
    tr: false,
    tg: false,
    al: false,
    av: false,
    an: false,
  });

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

  // Fetch cargas from all provider subcollections for today (real-time)
  useEffect(() => {
    const unsubscribes = [];
    const loadedProviders = new Set();
    const totalProviders = providers.length;

    providers.forEach((prov) => {
      const provColRef = collection(db, "cargas", todayId, prov);
      const unsubscribe = onSnapshot(
        provColRef,
        (provSnap) => {
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
            lastSync: prev.lastSync, // Keep last successful sync time
          }));
        }
      );
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [todayId]);

  useEffect(() => {
    const key_prov = PROVIDER_MAP[proveedor];
    const carga = (cargas[key_prov] || []).find(
      (c) => c.cargaNumber === cargaActual
    );
    setCurrentCarga(carga || {});
  }, [cargas, cargaActual, proveedor]);

  // Migration function to fix existing cargas with timestamp cargaNumbers
  const migrateCargaNumbers = async (provider) => {
    try {
      const provColRef = collection(db, "cargas", todayId, provider);
      const existingCargas = await getDocs(provColRef);

      const cargasToMigrate = [];
      existingCargas.docs.forEach((doc) => {
        const carga = doc.data();
        // If cargaNumber is a timestamp (very large number), it needs migration
        if (carga.cargaNumber && carga.cargaNumber > 1000000) {
          cargasToMigrate.push({ id: doc.id, data: carga });
        }
      });

      if (cargasToMigrate.length > 0) {
        console.log(
          `Migrating ${cargasToMigrate.length} cargas for provider ${provider}`
        );

        // Sort by creation time or timestamp to maintain order
        cargasToMigrate.sort((a, b) => {
          const timeA = a.data.createdAt || a.data.cargaNumber;
          const timeB = b.data.createdAt || b.data.cargaNumber;
          return new Date(timeA) - new Date(timeB);
        });

        // Assign simple consecutive numbers
        for (let i = 0; i < cargasToMigrate.length; i++) {
          const carga = cargasToMigrate[i];
          const newCargaNumber = i + 1;

          const cargaDocRef = doc(db, "cargas", todayId, provider, carga.id);
          await updateDoc(cargaDocRef, { cargaNumber: newCargaNumber });
        }

        console.log(`Migration completed for provider ${provider}`);
      }
    } catch (error) {
      console.error(`Error migrating cargas for provider ${provider}:`, error);
    }
  };

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

    const provColRef = collection(db, "cargas", todayId, provider);
    // Contador atómico por proveedor (transaction.get() solo acepta DocumentReference, no Query)
    const counterRef = doc(db, "cargas", todayId, "_counters", provider);

    // Refs de cargas existentes para inicializar el contador si no existe (solo lectura, se usa dentro de la transacción)
    const existingSnap = await getDocs(provColRef);
    const existingDocRefs = existingSnap.docs.map((d) => d.ref);

    await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);
      let newCargaNumber;

      if (counterSnap.exists()) {
        newCargaNumber = counterSnap.data().nextCargaNumber ?? 1;
        transaction.set(counterRef, {
          nextCargaNumber: newCargaNumber + 1,
        });
      } else if (existingDocRefs.length === 0) {
        newCargaNumber = 1;
        transaction.set(counterRef, { nextCargaNumber: 2 });
      } else {
        let maxCargaNumber = 0;
        for (const ref of existingDocRefs) {
          const snap = await transaction.get(ref);
          if (snap.exists()) {
            const n = snap.data().cargaNumber;
            if (typeof n === "number" && n > maxCargaNumber) maxCargaNumber = n;
          }
        }
        newCargaNumber = maxCargaNumber + 1;
        transaction.set(counterRef, { nextCargaNumber: newCargaNumber + 1 });
      }

      console.log(`Creating carga #${newCargaNumber} for provider ${provider}`);

      const newDocRef = doc(provColRef);
      transaction.set(newDocRef, {
        ...cargaData,
        cargaNumber: newCargaNumber,
        createdBy: currentAuthUser.email,
        createdAt: new Date().toISOString(),
      });
    });
    // Do not update local state here; onSnapshot will update the UI
  };

  // Update specific fields of a carga (field-level update)
  const updateCargaField = async (provider, cargaId, updatedFields) => {
    console.log(
      `Updating carga ${cargaId} for provider ${provider} with fields:`,
      updatedFields
    );
    const cargaDocRef = doc(db, "cargas", todayId, provider, cargaId);
    await updateDoc(cargaDocRef, updatedFields);
    // Do not update local state here; let onSnapshot handle it
  };

  // Delete a carga (simplified version)
  const deleteCarga = async (provider, cargaId) => {
    try {
      const cargaDocRef = doc(db, "cargas", todayId, provider, cargaId);
      await deleteDoc(cargaDocRef);
      // Do not update local state here; let onSnapshot handle it
    } catch (error) {
      console.error("Error deleting carga:", error);
      throw error;
    }
  };

  const [rol, setRol] = useState(() => {
    const savedRol = localStorage.getItem("rol");
    return savedRol ? savedRol : "";
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
    localStorage.setItem("guias_precintos", JSON.stringify(guias_precintos));
  }, [guias_precintos]);

  // Auto-migrate carga numbers when data is initially loaded
  useEffect(() => {
    if (syncStatus.hasInitialData) {
      providers.forEach(async (provider) => {
        const providerCargas = cargas[provider] || [];
        // Check if any cargas need migration (have timestamp cargaNumbers)
        const needsMigration = providerCargas.some(
          (carga) => carga.cargaNumber && carga.cargaNumber > 1000000
        );

        if (needsMigration) {
          console.log(`Auto-migrating carga numbers for provider: ${provider}`);
          await migrateCargaNumbers(provider);
        }
      });
    }
  }, [syncStatus.hasInitialData, cargas]);

  const values = {
    cargas,
    setCargas, // Optional: you may want to restrict direct usage
    addCarga,
    updateCargaField,
    deleteCarga,
    migrateCargaNumbers, // Migration function
    cargaActual,
    setCargaActual,
    currentCarga,
    rol,
    setRol,
    proveedor,
    setProveedor,
    guias_precintos,
    setGuias_precintos,
    // Estados de conectividad
    isOnline,
    syncStatus,
    providerSnapshotReceived,
  };

  return (
    <EstadosContext.Provider value={values}>{children}</EstadosContext.Provider>
  );
};
