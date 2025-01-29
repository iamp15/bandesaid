// filepath: /d:/Aplicaciones REACT/bandesaid/src/hooks/useLogger.js
import { useContext } from "react";
import { LogContext } from "../contexts/LogContext";

const useLogger = () => {
  const { addLogMessage } = useContext(LogContext);

  const log = (level, message) => {
    const logMessage = `${new Date().toISOString()} [${level}]: ${message}`;
    addLogMessage(level, logMessage);
    console[level](logMessage);
  };

  return {
    info: (message) => log("info", message),
    error: (message) => log("error", message),
  };
};

export default useLogger;
