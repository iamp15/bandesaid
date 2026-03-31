/**
 * Funciones de Firestore para gestionar la colección de choferes
 * Colección global: /choferes
 * El ID del documento es la cédula del chofer
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

// Referencia a la colección global de choferes
const choferesCollection = collection(db, "choferes");

/**
 * Obtener un listener en tiempo real para todos los choferes
 * @param {Function} callback - Función que recibe el array de choferes
 * @returns {Function} Función para cancelar el listener
 */
export const subscribeToChoferes = (callback) => {
  const q = query(choferesCollection, orderBy("nombre", "asc"));
  return onSnapshot(q, (snapshot) => {
    const choferes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(choferes);
  });
};

/**
 * Agregar un nuevo chofer
 * @param {Object} choferData - Datos del chofer { nombre, cedula }
 * @returns {Promise<string>} ID (cédula) del documento creado
 */
export const addChofer = async (choferData) => {
  const cedulaLimpia = choferData.cedula.replace(/\D/g, "");
  
  // Verificar si ya existe un chofer con esta cédula
  const choferDoc = doc(db, "choferes", cedulaLimpia);
  const existingDoc = await getDoc(choferDoc);
  
  if (existingDoc.exists()) {
    throw new Error("Ya existe un chofer registrado con esta cédula");
  }

  // Crear documento con la cédula como ID
  await setDoc(choferDoc, {
    nombre: choferData.nombre,
    cedula: choferData.cedula,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return cedulaLimpia;
};

/**
 * Actualizar un chofer existente
 * @param {string} choferId - Cédula del chofer (ID del documento)
 * @param {Object} choferData - Datos actualizados { nombre, cedula }
 * @returns {Promise<void>}
 */
export const updateChofer = async (choferId, choferData) => {
  const cedulaLimpiaNueva = choferData.cedula?.replace(/\D/g, "");
  
  // Si la cédula cambió, necesitamos crear un nuevo documento y eliminar el anterior
  if (cedulaLimpiaNueva && cedulaLimpiaNueva !== choferId) {
    // Verificar que la nueva cédula no exista
    const newDocRef = doc(db, "choferes", cedulaLimpiaNueva);
    const newDocSnap = await getDoc(newDocRef);
    
    if (newDocSnap.exists()) {
      throw new Error("Ya existe otro chofer registrado con esta cédula");
    }
    
    // Crear nuevo documento con la nueva cédula
    await setDoc(newDocRef, {
      nombre: choferData.nombre,
      cedula: choferData.cedula,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Eliminar documento antiguo
    const oldDocRef = doc(db, "choferes", choferId);
    await deleteDoc(oldDocRef);
  } else {
    // Actualizar documento existente
    const choferDoc = doc(db, "choferes", choferId);
    await updateDoc(choferDoc, {
      nombre: choferData.nombre,
      cedula: choferData.cedula,
      updatedAt: serverTimestamp(),
    });
  }
};

/**
 * Eliminar un chofer
 * @param {string} choferId - Cédula del chofer (ID del documento)
 * @returns {Promise<void>}
 */
export const deleteChofer = async (choferId) => {
  const choferDoc = doc(db, "choferes", choferId);
  await deleteDoc(choferDoc);
};

/**
 * Buscar choferes por nombre (búsqueda parcial)
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Array de choferes que coinciden
 */
export const searchChoferesByNombre = async (searchTerm) => {
  const snapshot = await getDocs(choferesCollection);
  const choferes = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const normalizedSearch = searchTerm.toLowerCase().trim();
  return choferes.filter((chofer) =>
    chofer.nombre?.toLowerCase().includes(normalizedSearch)
  );
};

/**
 * Buscar chofer por cédula
 * @param {string} cedula - Número de cédula
 * @returns {Promise<Object|null>} Chofer encontrado o null
 */
export const getChoferByCedula = async (cedula) => {
  const cedulaLimpia = cedula.replace(/\D/g, "");
  const choferDoc = doc(db, "choferes", cedulaLimpia);
  const snapshot = await getDoc(choferDoc);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};
