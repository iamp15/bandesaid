// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
export const auth = getAuth(app);
export const db = getFirestore(app);
