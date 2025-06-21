import { createContext, useState, useEffect, useContext } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { formatDate2 } from "../utils/FormatDate";

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

  // Fetch cargas from all provider subcollections for today (real-time)
  useEffect(() => {
    const unsubscribes = [];
    const newCargas = { id: todayId, tr: [], tg: [], al: [], av: [], an: [] };
    providers.forEach((prov) => {
      const provColRef = collection(db, "cargas", todayId, prov);
      const unsubscribe = onSnapshot(provColRef, (provSnap) => {
        newCargas[prov] = provSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setCargas({ ...newCargas });
      });
      unsubscribes.push(unsubscribe);
    });
    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [todayId]);

  // Add a new carga for a provider
  const addCarga = async (provider, cargaData) => {
    const provColRef = collection(db, "cargas", todayId, provider);
    const docRef = await addDoc(provColRef, cargaData);
    setCargas((prev) => ({
      ...prev,
      [provider]: [...(prev[provider] || []), { id: docRef.id, ...cargaData }],
    }));
  };

  // Update specific fields of a carga (field-level update)
  const updateCargaField = async (provider, cargaId, updatedFields) => {
    console.log(
      `Updating carga ${cargaId} for provider ${provider} with fields:`,
      updatedFields
    );
    const cargaDocRef = doc(db, "cargas", todayId, provider, cargaId);
    await updateDoc(cargaDocRef, updatedFields);
    setCargas((prev) => ({
      ...prev,
      [provider]: prev[provider].map((carga) =>
        carga.id === cargaId ? { ...carga, ...updatedFields } : carga
      ),
    }));
  };

  const deleteCarga = async (provider, cargaId) => {
    try {
      const cargaDocRef = doc(db, "cargas", todayId, provider, cargaId);
      console.log("Deleting carga at:", cargaDocRef.path);
      await deleteDoc(cargaDocRef);
      setCargas((prev) => {
        const updatedProviderCargas = Array.isArray(prev[provider])
          ? prev[provider].filter((carga) => carga.id !== cargaId)
          : [];
        const newState = {
          ...prev,
          [provider]: updatedProviderCargas,
        };
        console.log("Updated cargas state after delete:", newState);
        return newState;
      });
    } catch (error) {
      console.error("Error deleting carga:", error);
    }
  };

  const [cargaActual, setCargaActual] = useState(() => {
    // Initialize cargaActual from sessionStorage or use default value
    const savedCargaActual = localStorage.getItem("cargaActual");
    return savedCargaActual ? parseInt(savedCargaActual) : 0;
  });

  const [rol, setRol] = useState(() => {
    const savedRol = localStorage.getItem("rol");
    return savedRol ? savedRol : "";
  });

  const [proveedor, setProveedor] = useState(() => {
    const savedProveedor = localStorage.getItem("proveedor");
    return savedProveedor ? savedProveedor : "";
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

  const values = {
    cargas,
    setCargas, // Optional: you may want to restrict direct usage
    addCarga,
    updateCargaField,
    deleteCarga,
    cargaActual,
    setCargaActual,
    rol,
    setRol,
    proveedor,
    setProveedor,
    guias_precintos,
    setGuias_precintos,
  };

  return (
    <EstadosContext.Provider value={values}>{children}</EstadosContext.Provider>
  );
};
