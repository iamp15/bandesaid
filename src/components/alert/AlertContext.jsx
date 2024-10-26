/* eslint-disable react/prop-types */
// AlertContext.jsx
import { createContext, useContext, useState } from "react";
import Alert from "./Alert";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    setAlerts((prevAlerts) => [...prevAlerts, { id, message, type, duration }]);
  };

  const removeAlert = (id) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  const askConfirmation = (message, onConfirm) => {
    const id = Date.now();
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      { id, message, isConfirmation: true, onConfirm },
    ]);
  };

  return (
    <AlertContext.Provider value={{ addAlert, askConfirmation }}>
      {children}
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          duration={alert.duration}
          onClose={() => removeAlert(alert.id)}
          onConfirm={alert.onConfirm}
          isConfirmation={alert.isConfirmation}
        />
      ))}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
