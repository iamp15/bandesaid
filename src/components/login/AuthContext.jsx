/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.log("Creating new user document for:", user.uid);
            // Create a default user document
            try {
              const newUserData = {
                uid: user.uid,
                email: user.email,
                createdAt: new Date().toISOString(),
                // Add any other default fields you need
              };

              await setDoc(doc(db, "users", user.uid), newUserData);
              setUserData(newUserData);
            } catch (error) {
              console.error("Error creating user document:", error);
              setUserData(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
