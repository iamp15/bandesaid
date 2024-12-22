import { useState } from "react";
import PropTypes from "prop-types";
import "../styles/EditableField.css";

const EditableField = ({
  fieldName,
  label,
  value,
  placeholder,
  onSave,
  editHistory,
  formatValue = (val) => val, // Optional formatter function
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  // Check if field is locked before starting edit
  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(formatValue(value));
  };

  const handleSave = () => {
    onSave(fieldName, formatValue(editValue));
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  // Format the display value, not in the render
  const displayValue = value ? formatValue(value) : "No registrado";

  return (
    <div className="editable-field">
      <label htmlFor={fieldName}>
        <p className="label-bold">{label}:</p>
        {isEditing ? (
          <>
            <input
              type="text"
              id={fieldName}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
            />
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
  currentUser: PropTypes.object.isRequired,
  editHistory: PropTypes.object,
  formatValue: PropTypes.func,
};

export default EditableField;
