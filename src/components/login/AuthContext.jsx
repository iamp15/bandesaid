/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { storageUtils } from "../../utils/LoginPersistance";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userDataFromDB = userDoc.data();
        setUserData(userDataFromDB);
        return userDataFromDB;
      } else {
        console.log("No user document found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  useEffect(() => {
    // Check localStorage first
    const savedUser = storageUtils.getUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      fetchUserData(savedUser.uid); // Fetch Firestore data for saved user
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
        };

        // Fetch additional user data from Firestore
        const firestoreData = await fetchUserData(user.uid);

        // Combine auth and Firestore data
        const completeUserData = {
          ...userData,
          ...firestoreData,
        };
        console.log("complete user data:", completeUserData);
        setCurrentUser(completeUserData);
        storageUtils.setUser(completeUserData);
      } else {
        setCurrentUser(null);
        setUserData(null);
        storageUtils.clearAuth();
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async (resetStates) => {
    try {
      await auth.signOut();
      storageUtils.clearAuth();
      setCurrentUser(null);
      setUserData(null);

      // Reset all states passed as parameter
      if (resetStates) {
        resetStates();
      }

      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const value = {
    currentUser,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
