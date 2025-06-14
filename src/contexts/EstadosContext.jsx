import { createContext, useState, useEffect, useContext } from "react";
// Import Firestore dependencies
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { formatDate2 } from "../utils/FormatDate";

export const EstadosContext = createContext();

export function useEstados() {
  return useContext(EstadosContext);
}

// eslint-disable-next-line react/prop-types
export const EstadosProvider = ({ children }) => {
  const [cargas, setCargas] = useState(null); // Start as null to indicate loading
  const todayId = formatDate2();

  useEffect(() => {
    const fetchCargas = async () => {
      const cargasDocRef = doc(db, "cargas", todayId);
      const cargasSnap = await getDoc(cargasDocRef);
      if (cargasSnap.exists()) {
        setCargas(cargasSnap.data());
      } else {
        setCargas({
          id: todayId,
          tr: [],
          tg: [],
          al: [],
          av: [],
          an: [],
        });
      }
    };
    fetchCargas();
  }, [todayId]);

  // Sync cargas to Firestore when it changes (and is not null)
  useEffect(() => {
    if (cargas !== null) {
      const updateCargas = async () => {
        const cargasDocRef = doc(db, "cargas", todayId);
        await setDoc(cargasDocRef, cargas);
      };
      updateCargas();
      console.log("Cargas updated in Firestore");
    }
  }, [cargas, todayId]);

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
    setCargas,
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
