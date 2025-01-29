/* eslint-disable react/prop-types */
// filepath: /d:/Aplicaciones REACT/bandesaid/src/context/LogContext.js
import { createContext, useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { formatDate2 } from "../utils/FormatDate";
export const LogContext = createContext();

export const LogProvider = ({ children }) => {
  const [logMessages, setLogMessages] = useState([]);

  const addLogMessage = (level, message) => {
    setLogMessages((prevLogMessages) => [
      ...prevLogMessages,
      { level, message },
    ]);
  };

  const today = formatDate2();

  useEffect(() => {
    const fetchLogsFromFirestore = async () => {
      const docRef = doc(db, "logs", today);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setLogMessages(data.messages || []);
      }
    };

    fetchLogsFromFirestore();
  }, [today]);

  useEffect(() => {
    const saveLogsToFirestore = async () => {
      if (logMessages.length > 0) {
        try {
          await setDoc(doc(db, "logs", today), {
            messages: logMessages,
            timestamp: new Date().toISOString(),
          });
          setLogMessages([]); // Clear log messages after saving
        } catch (error) {
          console.error("Error writing log to Firestore:", error);
        }
      }
    };

    const intervalId = setInterval(saveLogsToFirestore, 60000); // Save logs every minute

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [logMessages, today]);

  return (
    <LogContext.Provider value={{ addLogMessage }}>
      {children}
    </LogContext.Provider>
  );
};
