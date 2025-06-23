import { createContext, useState, useEffect, useContext } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
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

  useEffect(() => {
    const key_prov = PROVIDER_MAP[proveedor];
    const carga = (cargas[key_prov] || []).find(
      (c) => c.cargaNumber === cargaActual
    );
    setCurrentCarga(carga || {});
  }, [cargas, cargaActual, proveedor]);

  // Add a new carga for a provider
  const addCarga = async (provider, cargaData) => {
    const provColRef = collection(db, "cargas", todayId, provider);
    await addDoc(provColRef, cargaData);
    // Do not update local state here; let onSnapshot handle it
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

  const deleteCarga = async (provider, cargaId) => {
    try {
      const cargaDocRef = doc(db, "cargas", todayId, provider, cargaId);
      console.log("Deleting carga at:", cargaDocRef.path);
      await deleteDoc(cargaDocRef);
      // Do not update local state here; let onSnapshot handle it
    } catch (error) {
      console.error("Error deleting carga:", error);
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
    guias_precintos,
    setGuias_precintos,
  };

  return (
    <EstadosContext.Provider value={values}>{children}</EstadosContext.Provider>
  );
};
