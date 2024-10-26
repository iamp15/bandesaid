/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

const Alert = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
  onConfirm,
  isConfirmation,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isConfirmation) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, isConfirmation]);

  if (!isVisible) return null;

  const alertStyles = {
    padding: "10px 20px",
    marginBottom: "15px",
    borderRadius: "4px",
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    position: "fixed",
    top: "40%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    cursor: "pointer",
  };

  const typeStyles = {
    success: { backgroundColor: "#4CAF50" },
    error: { backgroundColor: "#f44336" },
    warning: { backgroundColor: "#ff9800" },
    info: { backgroundColor: "#2196F3" },
    confirmation: { backgroundColor: "#c41a36" },
  };

  const buttonStyle = {
    margin: "10px 5px",
    padding: "5px 10px",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  };

  if (isConfirmation) {
    return (
      <div style={{ ...alertStyles, ...typeStyles.confirmation }}>
        <p>{message}</p>
        <button
          style={buttonStyle}
          onClick={() => {
            onConfirm(true);
            onClose();
          }}
        >
          Sí
        </button>
        <button
          style={buttonStyle}
          onClick={() => {
            onConfirm(false);
            onClose();
          }}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ ...alertStyles, ...typeStyles[type] }}
      onClick={() => {
        setIsVisible(false);
        onClose();
      }}
    >
      {message}
    </div>
  );
};

export default Alert;
