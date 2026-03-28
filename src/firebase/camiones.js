/**
 * Funciones de Firestore para gestionar la colección de camiones
 * Colección global: /camiones
 * El ID del documento es la placa normalizada del camión
 */
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./config";

// Referencia a la colección global de camiones
const camionesCollection = collection(db, "camiones");

/**
 * Obtener un listener en tiempo real para todos los camiones
 * @param {Function} callback - Función que recibe el array de camiones
 * @returns {Function} Función para cancelar el listener
 */
export const subscribeToCamiones = (callback) => {
  const q = query(camionesCollection, orderBy("placa", "asc"));
  return onSnapshot(q, (snapshot) => {
    const camiones = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(camiones);
  });
};

/**
 * Agregar un nuevo camión
 * @param {Object} camionData - Datos del camión { placa, marca }
 * @returns {Promise<string>} ID (placa normalizada) del documento creado
 */
export const addCamion = async (camionData) => {
  // Normalizar la placa (mayúsculas, sin espacios) para usar como ID
  const placaNormalizada = camionData.placa.toUpperCase().replace(/\s/g, "");

  // Verificar si ya existe un camión con esta placa
  const camionDoc = doc(db, "camiones", placaNormalizada);
  const existingDoc = await getDoc(camionDoc);

  if (existingDoc.exists()) {
    throw new Error("Ya existe un camión registrado con esta placa");
  }

  // Crear documento con la placa normalizada como ID
  await setDoc(camionDoc, {
    placa: camionData.placa.toUpperCase(),
    marca: camionData.marca,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return placaNormalizada;
};

/**
 * Actualizar un camión existente
 * @param {string} camionId - Placa normalizada del camión (ID del documento)
 * @param {Object} camionData - Datos actualizados { placa, marca }
 * @returns {Promise<void>}
 */
export const updateCamion = async (camionId, camionData) => {
  const placaNormalizadaNueva = camionData.placa?.toUpperCase().replace(/\s/g, "");
  
  // Si la placa cambió, necesitamos crear un nuevo documento y eliminar el anterior
  if (placaNormalizadaNueva && placaNormalizadaNueva !== camionId) {
    // Verificar que la nueva placa no exista
    const newDocRef = doc(db, "camiones", placaNormalizadaNueva);
    const newDocSnap = await getDoc(newDocRef);
    
    if (newDocSnap.exists()) {
      throw new Error("Ya existe otro camión registrado con esta placa");
    }
    
    // Crear nuevo documento con la nueva placa
    await setDoc(newDocRef, {
      placa: camionData.placa.toUpperCase(),
      marca: camionData.marca,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Eliminar documento antiguo
    const oldDocRef = doc(db, "camiones", camionId);
    await deleteDoc(oldDocRef);
  } else {
    // Actualizar documento existente
    const camionDoc = doc(db, "camiones", camionId);
    await updateDoc(camionDoc, {
      placa: camionData.placa.toUpperCase(),
      marca: camionData.marca,
      updatedAt: serverTimestamp(),
    });
  }
};

/**
 * Eliminar un camión
 * @param {string} camionId - Placa normalizada del camión (ID del documento)
 * @returns {Promise<void>}
 */
export const deleteCamion = async (camionId) => {
  const camionDoc = doc(db, "camiones", camionId);
  await deleteDoc(camionDoc);
};

/**
 * Buscar camiones por placa (búsqueda parcial)
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Array de camiones que coinciden
 */
export const searchCamionesByPlaca = async (searchTerm) => {
  const snapshot = await getDocs(camionesCollection);
  const camiones = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const normalizedSearch = searchTerm.toUpperCase().trim();
  return camiones.filter((camion) =>
    camion.placa?.toUpperCase().includes(normalizedSearch)
  );
};

/**
 * Buscar camión por placa exacta
 * @param {string} placa - Número de placa
 * @returns {Promise<Object|null>} Camión encontrado o null
 */
export const getCamionByPlaca = async (placa) => {
  const placaNormalizada = placa.toUpperCase().replace(/\s/g, "");
  const camionDoc = doc(db, "camiones", placaNormalizada);
  const snapshot = await getDoc(camionDoc);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

/**
 * Buscar camiones por marca
 * @param {string} marca - Marca del camión
 * @returns {Promise<Array>} Array de camiones de la marca especificada
 */
export const getCamionesByMarca = async (marca) => {
  const snapshot = await getDocs(camionesCollection);
  const camiones = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  return camiones.filter((camion) => 
    camion.marca?.toLowerCase() === marca.toLowerCase()
  );
};
