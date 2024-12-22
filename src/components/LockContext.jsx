/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect } from "react";
import { ref, get, remove } from "firebase/database";
import { database } from "../firebase/config";

const LockContext = createContext();

export const LockProvider = ({ children }) => {
  const lockRef = ref(database, "locks");

  // Cleanup expired locks periodically
  useEffect(() => {
    const cleanup = setInterval(async () => {
      try {
        const snapshot = await get(lockRef);
        const locks = snapshot.val();

        if (locks) {
          Object.entries(locks).forEach(([fieldId, lock]) => {
            if (Date.now() - lock.timestamp > 300000) {
              const fieldLockRef = ref(database, `locks/${fieldId}`);
              remove(fieldLockRef);
            }
          });
        }
      } catch (error) {
        console.error("Error cleaning up locks:", error);
      }
    }, 60000); // Run every minute

    return () => clearInterval(cleanup);
  }, []);

  return (
    <LockContext.Provider value={{ lockRef }}>{children}</LockContext.Provider>
  );
};

export const useLockContext = () => {
  const context = useContext(LockContext);
  if (!context) {
    throw new Error("useLockContext must be used within a LockProvider");
  }
  return context;
};
