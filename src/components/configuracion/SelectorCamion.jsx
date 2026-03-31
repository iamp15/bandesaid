/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { useEstados } from "../../contexts/EstadosContext";
import { capitalizeWords } from "../../utils/Capitalizer";
import { addCamion as addCamionToFirestore } from "../../firebase/camiones";
import { useAlert } from "../alert/AlertContext";

/**
 * Componente selector de camiones con búsqueda/autocompletado
 * 
 * @param {string} value - Valor actual del camión seleccionado (objeto camión o null)
 * @param {Function} onChange - Función que se llama cuando cambia la selección
 * @param {Function} onSave - Función para guardar el valor en Firestore (opcional)
 * @param {string} fieldName - Nombre del campo para guardar (por defecto: 'camion')
 */
const SelectorCamion = ({ 
  value, 
  onChange, 
  onSave, 
  fieldName = "camion" 
}) => {
  const { camiones, camionesLoaded } = useEstados();
  const { addAlert } = useAlert();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateOption, setShowCreateOption] = useState(false);
  const [showSinPlacaOption, setShowSinPlacaOption] = useState(false);
  const [newCamionData, setNewCamionData] = useState({ placa: "", marca: "" });
  const [isCreating, setIsCreating] = useState(false);
  const wrapperRef = useRef(null);

  // Filtrar camiones según búsqueda
  const filteredCamiones = camiones.filter((camion) => {
    if (!searchTerm) return true;
    const search = searchTerm.toUpperCase().trim();
    return (
      camion.placa?.toUpperCase().includes(search) ||
      camion.marca?.toLowerCase().includes(search.toLowerCase())
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
  const handleSelect = (camion) => {
    onChange(camion);
    setIsOpen(false);
    setShowCreateOption(false);
    setShowSinPlacaOption(false);
    setSearchTerm(""); // Limpiar búsqueda

    // Si hay función onSave, guardar en Firestore
    if (onSave) {
      onSave(fieldName, camion.id);
      // También guardar datos del camión para acceso offline
      onSave("camionId", camion.id);
      onSave("placa", camion.placa);
      onSave("marcaVehiculo", camion.marca);
    }
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm("");
    setIsOpen(true); // Mostrar el campo de búsqueda
    setShowCreateOption(false);
    setShowSinPlacaOption(false);

    if (onSave) {
      onSave(fieldName, null);
      onSave("camionId", null);
      onSave("placa", null);
      onSave("marcaVehiculo", null);
    }
  };

  const handleCreateCamion = () => {
    // Verificar que haya algo para buscar/crear
    if (searchTerm.trim()) {
      setNewCamionData({
        placa: searchTerm.toUpperCase().trim(),
        marca: "",
      });
      setShowCreateOption(true);
      setShowSinPlacaOption(false);
    }
  };

  const handleSelectSinPlaca = () => {
    // Mostrar el formulario para ingresar la marca del vehículo sin placa
    setShowSinPlacaOption(true);
    setShowCreateOption(false);
    setNewCamionData({ placa: "S/P", marca: "" });
  };

  const handleSaveSinPlaca = () => {
    if (!newCamionData.marca.trim()) {
      return;
    }

    // Crear el vehículo sin placa
    const camionSinPlaca = {
      id: "S/P",
      placa: "S/P",
      marca: capitalizeWords(newCamionData.marca.trim()),
      isSinPlaca: true,
    };
    
    // Seleccionar el vehículo sin placa
    onChange(camionSinPlaca);
    setIsOpen(false);
    setShowCreateOption(false);
    setShowSinPlacaOption(false);
    setSearchTerm("");
    setNewCamionData({ placa: "", marca: "" });

    // Si hay función onSave, guardar en Firestore
    if (onSave) {
      onSave(fieldName, "S/P");
      onSave("camionId", "S/P");
      onSave("placa", "S/P");
      onSave("marcaVehiculo", camionSinPlaca.marca);
    }
  };

  const handleNewCamionMarcaChange = (e) => {
    setNewCamionData((prev) => ({ 
      ...prev, 
      marca: e.target.value 
    }));
  };

  const handleSaveNewCamion = async () => {
    if (!newCamionData.placa.trim() || !newCamionData.marca.trim()) {
      return;
    }

    // Validar formato de placa: máximo 8 caracteres alfanuméricos, guiones permitidos, sin espacios
    const placaLimpia = newCamionData.placa.replace(/\s/g, "").toUpperCase();
    const placaRegex = /^[A-Z0-9-]{1,8}$/;
    if (!placaRegex.test(placaLimpia)) {
      addAlert("El formato de placa no es válido. Máximo 8 caracteres alfanuméricos, guiones permitidos", "warning");
      return;
    }

    setIsCreating(true);
    try {
      // Crear el camión en Firestore (la placa será el ID)
      const placaNormalizada = await addCamionToFirestore({
        placa: newCamionData.placa,
        marca: capitalizeWords(newCamionData.marca.trim()),
      });

      // Seleccionar el camión recién creado
      handleSelect({
        id: placaNormalizada,
        placa: newCamionData.placa.toUpperCase(),
        marca: capitalizeWords(newCamionData.marca.trim()),
      });

      addAlert("Camión creado exitosamente", "success");
    } catch (error) {
      console.error("Error al crear camión:", error);
      addAlert(error.message || "Error al crear el camión", "error");
    } finally {
      setIsCreating(false);
    }
  };

  if (!camionesLoaded) {
    return (
      <div style={{ padding: "10px", color: "#6c757d" }}>
        Cargando camiones...
      </div>
    );
  }

  // Si hay un valor seleccionado, mostrar solo el camión seleccionado
  if (value && !isOpen) {
    const isSinPlaca = value.isSinPlaca || value.id === "S/P";
    
    return (
      <div ref={wrapperRef} style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px",
            backgroundColor: isSinPlaca ? "#fff3cd" : "#d1e7dd",
            borderRadius: "4px",
            border: isSinPlaca ? "1px solid #ffc107" : "1px solid #badbcc",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", color: isSinPlaca ? "#856404" : "#155724" }}>
              {isSinPlaca ? "⚠️" : "✓"} {value.placa}
            </div>
            <div style={{ fontSize: "12px", color: isSinPlaca ? "#856404" : "#0f5132" }}>
              Marca: {value.marca}
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
        {isSinPlaca && (
          <div style={{ fontSize: "12px", color: "#856404", marginTop: "5px" }}>
            ⚠️ Vehículo sin placa - No se guarda en el catálogo
          </div>
        )}
        {value.isNew && !isSinPlaca && (
          <div style={{ fontSize: "12px", color: "#856404", marginTop: "5px" }}>
            ⚠️ Este camión aún no está guardado en el catálogo
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
            setSearchTerm(e.target.value.toUpperCase());
            setIsOpen(true);
            setShowCreateOption(false);
            setShowSinPlacaOption(false);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar por placa o marca..."
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
            textTransform: "uppercase",
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
          {/* Lista de camiones */}
          {filteredCamiones.length > 0 ? (
            filteredCamiones.map((camion) => (
              <div
                key={camion.id}
                onClick={() => handleSelect(camion)}
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
                <div style={{ fontWeight: "bold" }}>{camion.placa}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Marca: {camion.marca}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "10px", color: "#6c757d" }}>
              No se encontraron camiones
            </div>
          )}

          {/* Opción para crear nuevo camión */}
          {searchTerm.trim() && (
            <div
              onClick={handleCreateCamion}
              style={{
                padding: "10px",
                cursor: "pointer",
                backgroundColor: "#d4edda",
                borderTop: "1px solid #ccc",
                color: "#155724",
                fontWeight: "bold",
              }}
            >
              + Crear nuevo camión "{searchTerm.trim()}"
            </div>
          )}

          {/* Opción para vehículo sin placa - siempre visible */}
          {!showSinPlacaOption && (
            <div
              onClick={handleSelectSinPlaca}
              style={{
                padding: "10px",
                cursor: "pointer",
                backgroundColor: "#f8d7da",
                borderTop: searchTerm.trim() ? "1px solid #ccc" : "none",
                color: "#721c24",
                fontWeight: "bold",
              }}
            >
              🚫 Vehículo sin placa (S/P)
            </div>
          )}
        </div>
      )}

      {/* Formulario para nueva marca (si se seleccionó crear) */}
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
            Agregar marca para "{newCamionData.placa}"
          </div>
          <input
            type="text"
            value={newCamionData.marca}
            onChange={handleNewCamionMarcaChange}
            placeholder="Ej: Ford, Chevrolet, Toyota"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              marginBottom: "10px",
              textTransform: "capitalize",
            }}
          />
          <button
            type="button"
            onClick={handleSaveNewCamion}
            disabled={!newCamionData.marca.trim() || isCreating}
            style={{
              padding: "8px 16px",
              backgroundColor: newCamionData.marca.trim() && !isCreating
                ? "#28a745"
                : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: newCamionData.marca.trim() && !isCreating
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

      {/* Formulario para vehículo sin placa */}
      {showSinPlacaOption && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#f8d7da",
            borderRadius: "4px",
            border: "1px solid #f5c6cb",
          }}
        >
          <div style={{ marginBottom: "10px", fontWeight: "bold", color: "#721c24" }}>
            🚫 Vehículo sin placa
          </div>
          <input
            type="text"
            value={newCamionData.marca}
            onChange={(e) => setNewCamionData((prev) => ({ ...prev, marca: e.target.value }))}
            placeholder="Ingrese la marca del vehículo"
            autoFocus
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              marginBottom: "10px",
              textTransform: "capitalize",
            }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={handleSaveSinPlaca}
              disabled={!newCamionData.marca.trim()}
              style={{
                padding: "8px 16px",
                backgroundColor: newCamionData.marca.trim() ? "#28a745" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: newCamionData.marca.trim() ? "pointer" : "not-allowed",
              }}
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSinPlacaOption(false);
                setNewCamionData({ placa: "", marca: "" });
              }}
              style={{
                padding: "8px 16px",
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
        </div>
      )}
    </div>
  );
};

export default SelectorCamion;
