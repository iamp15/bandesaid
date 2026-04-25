/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { useEstados } from "../../contexts/EstadosContext";
import { capitalizeWords } from "../../utils/Capitalizer";
import { addChofer as addChoferToFirestore } from "../../firebase/choferes";
import { useAlert } from "../alert/AlertContext";
import { normalizeSearchText } from "../../utils/normalizeSearchText";

/**
 * Componente selector de choferes con búsqueda/autocompletado
 * 
 * @param {string} value - Valor actual del chofer seleccionado (objeto chofer o null)
 * @param {Function} onChange - Función que se llama cuando cambia la selección
 * @param {Function} onSave - Función para guardar el valor en Firestore (opcional)
 * @param {string} fieldName - Nombre del campo para guardar (por defecto: 'chofer')
 */
const SelectorChofer = ({ 
  value, 
  onChange, 
  onSave, 
  fieldName = "chofer" 
}) => {
  const { choferes, choferesLoaded } = useEstados();
  const { addAlert } = useAlert();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateOption, setShowCreateOption] = useState(false);
  const [newChoferData, setNewChoferData] = useState({ nombre: "", cedula: "" });
  const [isCreating, setIsCreating] = useState(false);
  const wrapperRef = useRef(null);

  // Filtrar choferes según búsqueda
  const filteredChoferes = choferes.filter((chofer) => {
    if (!searchTerm) return true;
    const search = normalizeSearchText(searchTerm);
    return (
      normalizeSearchText(chofer.nombre).includes(search) ||
      chofer.cedula?.includes(search)
    );
  });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setShowCreateOption(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cuando hay un valor seleccionado, mostrar el modo de selección en lugar del campo de búsqueda
  const handleSelect = (chofer) => {
    onChange(chofer);
    setIsOpen(false);
    setShowCreateOption(false);
    setSearchTerm(""); // Limpiar búsqueda

    // Si hay función onSave, guardar en Firestore
    if (onSave) {
      onSave(fieldName, chofer.id);
      // También guardar datos del chofer para acceso offline
      onSave("choferId", chofer.id);
      onSave("choferNombre", chofer.nombre);
      onSave("cedula", chofer.cedula);
    }
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm("");
    setIsOpen(true); // Mostrar el campo de búsqueda
    setShowCreateOption(false);

    if (onSave) {
      onSave(fieldName, null);
      onSave("choferId", null);
      onSave("choferNombre", null);
      onSave("cedula", null);
    }
  };

  const handleCreateChofer = () => {
    // Verificar que haya algo para buscar/crear
    if (searchTerm.trim()) {
      setNewChoferData({
        nombre: capitalizeWords(searchTerm.trim()),
        cedula: "",
      });
      setShowCreateOption(true);
    }
  };

  const handleNewChoferCedulaChange = (e) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, "");
    const parts = [];
    for (let i = cleaned.length; i > 0; i -= 3) {
      parts.unshift(cleaned.slice(Math.max(0, i - 3), i));
    }
    setNewChoferData((prev) => ({ ...prev, cedula: parts.join(".") }));
  };

  const handleSaveNewChofer = async () => {
    if (!newChoferData.nombre.trim() || !newChoferData.cedula.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      // Crear el chofer en Firestore (la cédula será el ID)
      const cedulaLimpia = await addChoferToFirestore({
        nombre: newChoferData.nombre,
        cedula: newChoferData.cedula,
      });

      // Seleccionar el chofer recién creado
      handleSelect({
        id: cedulaLimpia,
        nombre: newChoferData.nombre,
        cedula: newChoferData.cedula,
      });

      addAlert("Chofer creado exitosamente", "success");
    } catch (error) {
      console.error("Error al crear chofer:", error);
      addAlert(error.message || "Error al crear el chofer", "error");
    } finally {
      setIsCreating(false);
    }
  };

  if (!choferesLoaded) {
    return (
      <div style={{ padding: "10px", color: "#6c757d" }}>
        Cargando choferes...
      </div>
    );
  }

  // Si hay un valor seleccionado, mostrar solo el chofer seleccionado
  if (value && !isOpen) {
    return (
      <div ref={wrapperRef} style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px",
            backgroundColor: "#d1e7dd",
            borderRadius: "4px",
            border: "1px solid #badbcc",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", color: "#155724" }}>
              ✓ {value.nombre}
            </div>
            <div style={{ fontSize: "12px", color: "#0f5132" }}>
              Cédula: {value.cedula}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            style={{
              width: "36px",
              height: "36px",
              minWidth: "36px",
              minHeight: "36px",
              padding: "0",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Eliminar selección"
          >
            ✕
          </button>
        </div>
        {value.isNew && (
          <div style={{ fontSize: "12px", color: "#856404", marginTop: "5px" }}>
            ⚠️ Este chofer aún no está guardado en el catálogo
          </div>
        )}
      </div>
    );
  }

  // Modo de búsqueda/selección
  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      {/* Campo de búsqueda */}
      <div style={{ display: "flex", gap: "5px" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setShowCreateOption(false);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar o seleccionar chofer..."
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: "250px",
            overflowY: "auto",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 1000,
            marginTop: "5px",
          }}
        >
          {/* Lista de choferes */}
          {filteredChoferes.length > 0 ? (
            filteredChoferes.map((chofer) => (
              <div
                key={chofer.id}
                onClick={() => handleSelect(chofer)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  backgroundColor: "white",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white";
                }}
              >
                <div style={{ fontWeight: "bold" }}>{chofer.nombre}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Cédula: {chofer.cedula}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "10px", color: "#6c757d" }}>
              No se encontraron choferes
            </div>
          )}

          {/* Opción para crear nuevo chofer */}
          {searchTerm.trim() && (
            <div
              onClick={handleCreateChofer}
              style={{
                padding: "10px",
                cursor: "pointer",
                backgroundColor: "#d4edda",
                borderTop: "1px solid #ccc",
                color: "#155724",
                fontWeight: "bold",
              }}
            >
              + Crear nuevo chofer "{capitalizeWords(searchTerm.trim())}"
            </div>
          )}
        </div>
      )}

      {/* Formulario para nueva cédula (si se seleccionó crear) */}
      {showCreateOption && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#fff3cd",
            borderRadius: "4px",
            border: "1px solid #ffc107",
          }}
        >
          <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
            Agregar cédula para "{newChoferData.nombre}"
          </div>
          <input
            type="text"
            value={newChoferData.cedula}
            onChange={handleNewChoferCedulaChange}
            placeholder="Ej: 12.345.678"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              marginBottom: "10px",
            }}
          />
          <button
            type="button"
            onClick={handleSaveNewChofer}
            disabled={!newChoferData.cedula.trim() || isCreating}
            style={{
              padding: "8px 16px",
              backgroundColor: newChoferData.cedula.trim() && !isCreating
                ? "#28a745"
                : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: newChoferData.cedula.trim() && !isCreating
                ? "pointer"
                : "not-allowed",
            }}
          >
            {isCreating ? "Guardando..." : "Guardar y Seleccionar"}
          </button>
          <button
            type="button"
            onClick={() => setShowCreateOption(false)}
            style={{
              padding: "8px 16px",
              marginLeft: "10px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default SelectorChofer;
