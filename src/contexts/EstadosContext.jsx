import { createContext, useState, useEffect, useContext } from "react";
import { getCurrentTime } from "../utils/TimeUtils";
import { db } from "../firebase/config";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { formatDate2 } from "../utils/FormatDate";
import { useAlert } from "../components/alert/AlertContext";
import { useAuth } from "../components/login/AuthContext";
import { saveLog } from "../utils/LogSystem";

export const EstadosContext = createContext();

export function useEstados() {
  return useContext(EstadosContext);
}

// eslint-disable-next-line react/prop-types
export const EstadosProvider = ({ children }) => {
  const [cargas, setCargas] = useState({
    version: "1",
    tr: [],
    tg: [],
    al: [],
    av: [],
    an: [],
  });

  const [cargaActual, setCargaActual] = useState(() => {
    // Initialize cargaActual from sessionStorage or use default value
    const savedCargaActual = sessionStorage.getItem("cargaActual");
    return savedCargaActual ? parseInt(savedCargaActual) : 0;
  });

  const [rol, setRol] = useState(() => {
    const savedRol = sessionStorage.getItem("rol");
    return savedRol ? savedRol : "";
  });

  const [proveedor, setProveedor] = useState(() => {
    const savedProveedor = sessionStorage.getItem("proveedor");
    return savedProveedor ? savedProveedor : "";
  });

  const [guias_precintos, setGuias_precintos] = useState(() => {
    const savedGuias_precintos = sessionStorage.getItem("guias_precintos");
    return savedGuias_precintos
      ? JSON.parse(savedGuias_precintos)
      : {
          guias: "",
          precintos: "",
        };
  });

  const today = formatDate2();
  const time = getCurrentTime();
  const docRef = doc(db, "cargas", today);
  //const { addAlert } = useAlert();
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const loading = auth?.loading;

  useEffect(() => {
    if (!currentUser) return; // Don't set up listener if not authenticated

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const firestoreCargas = snapshot.data();

        if (firestoreCargas.version > cargas.version) {
          const mergedCargas = { ...cargas };

          // Merge local and Firestore data
          Object.keys(firestoreCargas).forEach((key) => {
            if (Array.isArray(firestoreCargas[key])) {
              mergedCargas[key] = firestoreCargas[key].map((item, index) => {
                if (mergedCargas[key][index]) {
                  const localItem = mergedCargas[key][index];

                  // Compare all fields in the nested object, excluding specific fields
                  for (const field of Object.keys(item)) {
                    if (
                      field !== "editHistory" && // Exclude "editHistory"
                      field !== "tk" && // Exclude "tk"
                      field !== "paletas" && // Exclude "paletas"
                      field !== "paredes" && // Exclude "paredes"
                      field !== "olor" && // Exclude "olor"
                      field !== "otroOlor" && // Exclude "otroOlor"
                      field !== "puertaLateral" && // Exclude "puertaLateral"
                      field !== "cnd" && // Exclude "cnd"
                      field !== "muestras" && // Exclude "muestras"
                      field !== "temperaturas" && // Exclude "temperaturas"
                      field !== "pesos" && // Exclude "pesos"
                      field !== "codigos_guias" && // Exclude "codigos_guias"
                      field !== "pesos_guias" && // Exclude "pesos_guias"
                      field !== "precintos" && // Exclude "precintos"
                      item[field] &&
                      localItem[field]
                    ) {
                      // Skip prompt if old data equals new data
                      if (item[field] === localItem[field]) {
                        continue;
                      }

                      const message = `Ya existe información para el campo [${field}]. ¿Deseas sustituir "${localItem[field]}" por "${item[field]}"?`;
                      const overwrite = window.confirm(message);
                      if (!overwrite) {
                        return localItem; // Keep local data if user chooses not to overwrite
                      }
                    }
                  }
                  return item; // Overwrite with new data if no conflicts or user agrees
                }
                return item; // Add new item if no local data exists
              });
            } else {
              mergedCargas[key] = firestoreCargas[key];
            }
          });

          setCargas(mergedCargas);
          saveLog(
            `Merged local cargas with Firestore version ${firestoreCargas.version}`
          );
        }
      } else {
        // Only set the document if local cargas state is empty
        if (
          cargas.tr.length === 0 &&
          cargas.tg.length === 0 &&
          cargas.al.length === 0 &&
          cargas.av.length === 0 &&
          cargas.an.length === 0
        ) {
          setDoc(docRef, cargas);
          saveLog(`Write to Firestore: Created new cargas at ${time}`);
        }
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [currentUser, cargas]);

  const checkOnlineStatus = () => {
    saveLog(`Checking online status at ${time}: ${navigator.onLine}`);
    return navigator.onLine;
  };

  const updateCargas = async (newCargas) => {
    if (!currentUser) return; // Don't attempt update if not authenticated

    if (!checkOnlineStatus()) {
      /*addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );*/
      saveLog(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }

    // If newCargas is a function, execute it to get the new state
    const updatedCargas =
      typeof newCargas === "function" ? newCargas(cargas) : newCargas;

    // Increment the version number
    const updatedCargasWithVersion = {
      ...updatedCargas,
      version: parseInt(updatedCargas.version) + 1,
    };

    const saveToFirestore = async (data, retries = 3) => {
      try {
        await setDoc(doc(db, "cargas", today), data);
        saveLog(`Write to Firestore: Updated cargas version ${data.version}`);
        console.log("Cargas updated!");
        setCargas(data);
      } catch (error) {
        if (retries > 0) {
          saveLog(`Retrying to update cargas: ${retries} attempts left`);
          console.error("Error updating cargas:", error);
          setTimeout(() => saveToFirestore(data, retries - 1), 1000);
          //addAlert("Hubo un error al guardar la información", "error");
        } else {
          saveLog(`Error updating cargas: ${error}`, "error");
          console.error("Error updating cargas:", error);
          //addAlert("Hubo un error al guardar la información", "error");
        }
      }
    };
    saveToFirestore(updatedCargasWithVersion);
  };

  // Save cargaActual to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("cargaActual", cargaActual.toString());
  }, [cargaActual]);

  useEffect(() => {
    sessionStorage.setItem("rol", rol);
  }, [rol]);

  useEffect(() => {
    sessionStorage.setItem("proveedor", proveedor);
  }, [proveedor]);

  useEffect(() => {
    sessionStorage.setItem("guias_precintos", JSON.stringify(guias_precintos));
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
    updateCargas,
  };

  return (
    <EstadosContext.Provider value={values}>{children}</EstadosContext.Provider>
  );
};
