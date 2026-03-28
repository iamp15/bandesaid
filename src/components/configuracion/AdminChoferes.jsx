/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useEstados } from "../../contexts/EstadosContext";
import { useAlert } from "../alert/AlertContext";
import { capitalizeWords } from "../../utils/Capitalizer";
import LoadingSpinner from "../LoadingSpinner";
import { checkOnlineStatus } from "../../utils/OnlineStatus";

const AdminChoferes = () => {
  const {
    choferes,
    choferesLoaded,
    addChofer,
    updateChofer,
    deleteChofer,
    isOnline,
  } = useEstados();
  const { addAlert, askConfirmation } = useAlert();

  // Estados para el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar choferes según búsqueda
  const filteredChoferes = choferes.filter((chofer) => {
    const search = searchTerm.toLowerCase().trim();
    return (
      chofer.nombre?.toLowerCase().includes(search) ||
      chofer.cedula?.toLowerCase().includes(search)
    );
  });

  // Resetear formulario al cerrar
  useEffect(() => {
    if (!showForm) {
      setFormData({ nombre: "", cedula: "" });
      setEditingId(null);
    }
  }, [showForm]);

  // Formatear cédula con puntos
  const formatCedula = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const parts = [];
    for (let i = cleaned.length; i > 0; i -= 3) {
      parts.unshift(cleaned.slice(Math.max(0, i - 3), i));
    }
    return parts.join(".");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "cedula") {
      // Para cédula, permitimos números y formateamos
      const cleaned = value.replace(/[^0-9.]/g, "");
      setFormData((prev) => ({ ...prev, [name]: formatCedula(cleaned) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkOnlineStatus()) {
      addAlert("No hay conexión a internet. No se puede guardar.", "error");
      return;
    }

    if (!formData.nombre.trim() || !formData.cedula.trim()) {
      addAlert("Por favor, complete todos los campos.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateChofer(editingId, {
          nombre: capitalizeWords(formData.nombre.trim()),
          cedula: formData.cedula,
        });
        addAlert("Chofer actualizado exitosamente.", "success");
      } else {
        await addChofer({
          nombre: capitalizeWords(formData.nombre.trim()),
          cedula: formData.cedula,
        });
        addAlert("Chofer agregado exitosamente.", "success");
      }
      setShowForm(false);
      setFormData({ nombre: "", cedula: "" });
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar chofer:", error);
      addAlert(error.message || "Error al guardar el chofer.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (chofer) => {
    setFormData({
      nombre: chofer.nombre || "",
      cedula: chofer.cedula || "",
    });
    // El ID es la cédula limpia
    setEditingId(chofer.id || chofer.cedula?.replace(/\D/g, ""));
    setShowForm(true);
  };

  const handleDelete = (chofer) => {
    if (!checkOnlineStatus()) {
      addAlert("No hay conexión a internet. No se puede eliminar.", "error");
      return;
    }

    askConfirmation(
      `¿Está seguro de eliminar al chofer "${chofer.nombre}"?`,
      async (confirmed) => {
        if (confirmed) {
          try {
            await deleteChofer(chofer.id);
            addAlert("Chofer eliminado exitosamente.", "success");
          } catch (error) {
            console.error("Error al eliminar chofer:", error);
            addAlert("Error al eliminar el chofer.", "error");
          }
        }
      }
    );
  };

  if (!choferesLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Administración de Choferes</h2>

        {/* Indicador de conectividad */}
        {!isOnline && (
          <div style={{
            padding: "10px",
            backgroundColor: "#fff3cd",
            color: "#856404",
            borderRadius: "4px",
            marginBottom: "15px",
            textAlign: "center"
          }}>
            ⚠️ Sin conexión a internet. Los cambios no se guardarán.
          </div>
        )}

        {/* Barra de búsqueda */}
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Botón para agregar */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              marginBottom: "15px",
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            + Agregar Chofer
          </button>
        )}

        {/* Formulario */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #dee2e6",
            }}
          >
            <h3>{editingId ? "Editar Chofer" : "Nuevo Chofer"}</h3>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Nombre:
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Nombre completo del chofer"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  textTransform: "capitalize",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Cédula:
              </label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                placeholder="Ej: 12.345.678"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "10px 20px",
                  backgroundColor: isSubmitting ? "#6c757d" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "14px",
                }}
              >
                {isSubmitting ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ nombre: "", cedula: "" });
                  setEditingId(null);
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista de choferes */}
        <div style={{ marginTop: "20px" }}>
          <h3>Lista de Choferes ({filteredChoferes.length})</h3>

          {filteredChoferes.length === 0 ? (
            <p style={{ color: "#6c757d", fontStyle: "italic" }}>
              {searchTerm
                ? "No se encontraron choferes con esa búsqueda."
                : "No hay choferes registrados. Agregue uno usando el botón de arriba."}
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                  }}
                >
                  <th style={tableHeaderStyle}>Nombre</th>
                  <th style={tableHeaderStyle}>Cédula</th>
                  <th style={tableHeaderStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredChoferes.map((chofer) => (
                  <tr
                    key={chofer.id}
                    style={{
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    <td style={tableCellStyle}>{chofer.nombre}</td>
                    <td style={tableCellStyle}>{chofer.cedula}</td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => handleEdit(chofer)}
                        disabled={!isOnline}
                        style={{
                          padding: "5px 10px",
                          marginRight: "5px",
                          backgroundColor: "#ffc107",
                          color: "#212529",
                          border: "none",
                          borderRadius: "4px",
                          cursor: isOnline ? "pointer" : "not-allowed",
                          fontSize: "12px",
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(chofer)}
                        disabled={!isOnline}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: isOnline ? "pointer" : "not-allowed",
                          fontSize: "12px",
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Botón volver */}
        <div className="button-group" style={{ marginTop: "30px" }}>
          <Link to={"/menuConfiguracion"}>
            <button>Volver al Menú</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const tableHeaderStyle = {
  padding: "12px",
  textAlign: "left",
  fontWeight: "bold",
};

const tableCellStyle = {
  padding: "12px",
  textAlign: "left",
};

export default AdminChoferes;
