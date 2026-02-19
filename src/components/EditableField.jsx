import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../styles/EditableField.css";
import { useAlert } from "./alert/AlertContext";
import CopyToClipboard from "react-copy-to-clipboard";

const EditableField = ({
  fieldName,
  label,
  value,
  placeholder,
  onSave,
  onChange,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  editHistory,
  autoComplete,
  onEdit,
  setOnEdit,
  unit,
  formatValue = (val) => val, // Optional formatter function
}) => {
  const [editValue, setEditValue] = useState("");
  const { addAlert } = useAlert();
  const [showNotification, setShowNotification] = useState(false);

  // Added useEffect to set editValue when isEditing becomes true
  useEffect(() => {
    if (onEdit) {
      setEditValue(value);
    }
  }, [onEdit, value]);

  // Check if field is locked before starting edit
  const handleEdit = () => {
    if (onEdit) {
      addAlert("Otro campo está siendo editado.", "error");
      return;
    }
    setOnEdit(fieldName);
    setEditValue(value);
  };

  const handleSave = () => {
    onSave(fieldName, formatValue(editValue));
    setOnEdit(null);
  };

  const cancelEditing = () => {
    setEditValue(value);
    setOnEdit(null);
  };

  const setUnit = () => {
    if (unit) {
      return " " + unit;
    } else {
      return "";
    }
  };

  const handleCopy = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000); // Hide after 2 seconds
  };

  // Format the display value, not in the render
  const displayValue = value ? formatValue(value) + setUnit() : "No registrado";

  return (
    <div className="editable-field">
      <label htmlFor={fieldName}>
        <p className="label-bold">{label}:</p>
        {onEdit === fieldName ? (
          <>
            <input
              className="edit-input"
              type="text"
              id={fieldName}
              value={editValue || ""}
              onChange={(e) => {
                setEditValue(e.target.value);
                if (onChange) onChange(e); // Call onChange if provided
              }}
              placeholder={placeholder}
              onFocus={() => {
                if (!showSuggestions) setShowSuggestions(true);
              }}
              onBlur={() => {
                if (showSuggestions)
                  setTimeout(() => setShowSuggestions(false), 200);
              }}
              autoComplete={autoComplete}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((company) => (
                  <li
                    key={company.codigo}
                    onMouseDown={() => {
                      setEditValue(company.nombre);
                      setShowSuggestions(false);
                    }}
                  >
                    {company.nombre}
                  </li>
                ))}
              </ul>
            )}
            <div className="button-group">
              <button type="button" onClick={cancelEditing}>
                Cancelar
              </button>
              <button type="button" onClick={handleSave}>
                Guardar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="display-container">
              <span>{displayValue}</span>

              <CopyToClipboard text={displayValue} onCopy={handleCopy}>
                <button type="button" className="copy-button" title="Copiar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </CopyToClipboard>
              {showNotification && (
                <div className="notification">¡Información copiada!</div>
              )}

              <button
                type="button"
                className="edit-button"
                onClick={handleEdit}
              >
                Editar
              </button>
            </div>
            {value && editHistory?.[fieldName] && (
              <p className="autor">
                Editado por: {editHistory[fieldName].editedBy}
                {" a las "}
                {new Date(editHistory[fieldName].editedAt).toLocaleTimeString(
                  "es-ES",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true, // This ensures 24-hour format
                  }
                )}
              </p>
            )}
          </>
        )}
      </label>
    </div>
  );
};

EditableField.propTypes = {
  fieldName: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  currentUser: PropTypes.object.isRequired,
  editHistory: PropTypes.object,
  suggestions: PropTypes.array, // Added suggestions to propTypes
  showSuggestions: PropTypes.bool, // Added showSuggestions to propTypes
  setShowSuggestions: PropTypes.func,
  formatValue: PropTypes.func,
  autoComplete: PropTypes.string,
  setOnEdit: PropTypes.func.isRequired,
  onEdit: PropTypes.string,
  unit: PropTypes.string,
};

export default EditableField;
