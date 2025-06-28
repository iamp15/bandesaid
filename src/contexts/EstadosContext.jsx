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

  // Add a new carga for a provider with atomic cargaNumber assignment
  const addCarga = async (provider, cargaData) => {
    const provColRef = collection(db, "cargas", todayId, provider);
    const counterDocRef = doc(
      db,
      "cargas",
      todayId,
      `${provider}_counter`,
      "last"
    );
    await runTransaction(db, async (transaction) => {
      // Get the current counter (last used cargaNumber)
      let lastCargaNumber = 0;
      const counterSnap = await transaction.get(counterDocRef);
      if (counterSnap.exists()) {
        lastCargaNumber = counterSnap.data().value || 0;
      }
      const newCargaNumber = lastCargaNumber + 1;
      // Update the counter
      transaction.set(counterDocRef, { value: newCargaNumber });
      // Add the new carga with the next cargaNumber
      const newCargaRef = doc(provColRef); // Create a new doc ref with auto-id
      transaction.set(newCargaRef, {
        ...cargaData,
        cargaNumber: newCargaNumber,
      });
    });
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

  // Delete a carga and update the counter
  const deleteCarga = async (provider, cargaId) => {
    try {
      const provColRef = collection(db, "cargas", todayId, provider);
      const counterDocRef = doc(
        db,
        "cargas",
        todayId,
        `${provider}_counter`,
        "last"
      );
      // Get the carga to delete (to know its cargaNumber)
      const cargaDocRef = doc(db, "cargas", todayId, provider, cargaId);
      const cargaSnap = await getDocs(query(provColRef));
      let deletedCargaNumber = null;
      cargaSnap.docs.forEach((docSnap) => {
        if (docSnap.id === cargaId) {
          deletedCargaNumber = docSnap.data().cargaNumber;
        }
      });

      // Get the current counter value
      let lastCargaNumber = 0;
      const counterSnap = await getDocs(
        collection(db, "cargas", todayId, `${provider}_counter`)
      );
      if (!counterSnap.empty) {
        const lastDoc = counterSnap.docs[0];
        lastCargaNumber = lastDoc.data().value || 0;
      }

      // Delete the carga and update the counter if needed
      await runTransaction(db, async (transaction) => {
        transaction.delete(cargaDocRef);
        if (deletedCargaNumber && deletedCargaNumber === lastCargaNumber) {
          // Decrement the counter by 1 if the deleted carga was the last one
          const newCounterValue = lastCargaNumber - 1;
          transaction.set(counterDocRef, { value: newCounterValue });
        }
      });
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
