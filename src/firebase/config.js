// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1xjmBl524O6ihYQgtFG4J9NOX9zxRsQ8",
  authDomain: "bandesaid-221ac.firebaseapp.com",
  projectId: "bandesaid-221ac",
  storageBucket: "bandesaid-221ac.firebasestorage.app",
  messagingSenderId: "951528483061",
  appId: "1:951528483061:web:b1fc9c40bbd206859e3dbc",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { auth, db, database };
