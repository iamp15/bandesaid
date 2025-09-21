/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../../firebase/config";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import { storageUtils } from "../../utils/LoginPersistance";
import { saveLog } from "../../utils/LogSystem";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log("Firebase user authenticated:", firebaseUser.email);

          // Fetch or create user data in Firestore
          const userData = await fetchUserData(firebaseUser);
          const userToStore = {
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            ...userData,
          };

          // Store user data in session storage
          storageUtils.setUser(userToStore);
          setCurrentUser(userToStore);

          // Navigate to menu if on login page
          if (location.pathname === "/") {
            navigate("/menu");
          }
        } else {
          console.log("No Firebase user authenticated");
          // Check if we have user in storage (for persistence)
          const storedUser = storageUtils.getUser();
          if (storedUser) {
            console.log(
              "Found user in storage, but Firebase not authenticated"
            );
            // Clear storage if Firebase is not authenticated
            storageUtils.removeUser();
          }
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        saveLog(`Error in auth state change: ${error.message}`, "error");
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [location.pathname, navigate]);

  const fetchUserData = async (user) => {
    try {
      console.log("Fetching user data for:", user.email);
      saveLog(`Fetching user data for: ${user.email}`, "info");
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log("User document found");
        return userSnap.data();
      } else {
        console.log("Creating new user document");
        const userData = {
          email: user.email,
          createdAt: new Date().toISOString(),
          // Add any other initial user data you want to store
        };
        await setDoc(userRef, userData);
        return userData;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      saveLog(`Error fetching user data: ${error.message}`, "error");
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Starting login for:", email);
      saveLog(`Starting login for: ${email}`);

      // Sign in with Firebase Auth - onAuthStateChanged will handle the rest
      await signInWithEmailAndPassword(auth, email, password);

      console.log("Auth successful for:", email);
      saveLog(`Auth successful for: ${email}`);

      // onAuthStateChanged will handle user state and navigation
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.code === "auth/wrong-password"
          ? "Invalid password"
          : error.code === "auth/user-not-found"
          ? "User not found"
          : error.code === "auth/invalid-email"
          ? "Invalid email format"
          : "An error occurred during login"
      );
      saveLog(`Login error: ${error.message}`);
      setLoading(false); // Set loading to false on error
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      localStorage.clear();
      sessionStorage.clear();
      await signOut(auth);
      setCurrentUser(null);
      console.log("Logout successful");
      saveLog("Logout successful");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      saveLog(`Logout error: ${error.message}`, "error");
      setError("Failed to log out");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    login,
    loading,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
}
