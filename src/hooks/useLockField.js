// hooks/useLockField.js
import { useState, useEffect } from "react";
import { useLockContext } from "../components/LockContext";
import {
  ref,
  onValue,
  off,
  runTransaction,
  serverTimestamp,
} from "firebase/database";
import { database } from "../firebase/config";

export const useLockField = (fieldId, currentUser) => {
  const { lockRef } = useLockContext();
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditor, setCurrentEditor] = useState(null);
  const fieldLockRef = ref(database, `locks/${fieldId}`);

  useEffect(() => {
    const handleLockChange = (snapshot) => {
      const lockData = snapshot.val();
      if (lockData && lockData.userName !== currentUser.name) {
        setCurrentEditor(lockData.userName);
      } else {
        setCurrentEditor(null);
      }
    };

    // Subscribe to changes
    onValue(fieldLockRef, handleLockChange);

    // Cleanup
    return () => {
      off(fieldLockRef);
      if (isEditing) {
        releaseLock();
      }
    };
  }, [fieldId, currentUser.name]);

  const acquireLock = async () => {
    try {
      const result = await runTransaction(fieldLockRef, (currentLock) => {
        if (
          currentLock === null ||
          Date.now() - currentLock.timestamp > 300000
        ) {
          return {
            userName: currentUser.name,
            timestamp: serverTimestamp(),
          };
        }
        return undefined; // abort the transaction
      });

      if (result.committed) {
        setIsEditing(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error acquiring lock:", error);
      return false;
    }
  };

  const releaseLock = async () => {
    try {
      await runTransaction(fieldLockRef, (currentLock) => {
        if (currentLock && currentLock.userName === currentUser.name) {
          return null;
        }
        return currentLock;
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error releasing lock:", error);
    }
  };

  return {
    isEditing,
    currentEditor,
    acquireLock,
    releaseLock,
  };
};
