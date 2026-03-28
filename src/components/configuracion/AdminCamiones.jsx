/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useEstados } from "../../contexts/EstadosContext";
import { useAlert } from "../alert/AlertContext";
import { capitalizeWords } from "../../utils/Capitalizer";
import LoadingSpinner from "../LoadingSpinner";
import { checkOnlineStatus } from "../../utils/OnlineStatus";

const AdminCamiones = () => {
  const {
    camiones,
    camionesLoaded,
    addCamion,
    updateCamion,
    deleteCamion,
    isOnline,
  } = useEstados();
  const { addAlert, askConfirmation } = useAlert();

  // Estados para el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    placa: "",
    marca: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar camiones según búsqueda
  const filteredCamiones = camiones.filter((camion) => {
    const search = searchTerm.toLowerCase().trim();
    return (
      camion.placa?.toLowerCase().includes(search) ||
      camion.marca?.toLowerCase().includes(search)
    );
  });

  // Resetear formulario al cerrar
  useEffect(() => {
    if (!showForm) {
      setFormData({ placa: "", marca: "" });
      setEditingId(null);
    }
  }, [showForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "placa") {
      // Normalizar placa a mayúsculas
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
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

    if (!formData.placa.trim() || !formData.marca.trim()) {
      addAlert("Por favor, complete todos los campos.", "warning");
      return;
    }

    // Validar formato de placa: máximo 8 caracteres alfanuméricos, guiones permitidos, sin espacios
    const placaLimpia = formData.placa.replace(/\s/g, "").toUpperCase();
    const placaRegex = /^[A-Z0-9-]{1,8}$/;
    if (!placaRegex.test(placaLimpia)) {
      addAlert(
        "El formato de placa no es válido. Máximo 8 caracteres alfanuméricos, guiones permitidos",
        "warning"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateCamion(editingId, {
          placa: formData.placa.trim(),
          marca: capitalizeWords(formData.marca.trim()),
        });
        addAlert("Camión actualizado exitosamente.", "success");
      } else {
        await addCamion({
          placa: formData.placa.trim(),
          marca: capitalizeWords(formData.marca.trim()),
        });
        addAlert("Camión agregado exitosamente.", "success");
      }
      setShowForm(false);
      setFormData({ placa: "", marca: "" });
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar camión:", error);
      addAlert(error.message || "Error al guardar el camión.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (camion) => {
    setFormData({
      placa: camion.placa || "",
      marca: camion.marca || "",
    });
    // El ID es la placa normalizada
    setEditingId(camion.id || camion.placa?.toUpperCase().replace(/\s/g, ""));
    setShowForm(true);
  };

  const handleDelete = (camion) => {
    if (!checkOnlineStatus()) {
      addAlert("No hay conexión a internet. No se puede eliminar.", "error");
      return;
    }

    askConfirmation(
      `¿Está seguro de eliminar el camión con placa "${camion.placa}"?`,
      async (confirmed) => {
        if (confirmed) {
          try {
            await deleteCamion(camion.id);
            addAlert("Camión eliminado exitosamente.", "success");
          } catch (error) {
            console.error("Error al eliminar camión:", error);
            addAlert("Error al eliminar el camión.", "error");
          }
        }
      }
    );
  };

  if (!camionesLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Administración de Camiones</h2>

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
            placeholder="Buscar por placa o marca..."
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
            + Agregar Camión
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
            <h3>{editingId ? "Editar Camión" : "Nuevo Camión"}</h3>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Placa:
              </label>
              <input
                type="text"
                name="placa"
                value={formData.placa}
                onChange={handleInputChange}
                placeholder="Ej: X1X-123 o AB-1234"
                required
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

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Marca:
              </label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleInputChange}
                placeholder="Ej: Ford, Chevrolet, Toyota"
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
                  setFormData({ placa: "", marca: "" });
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

        {/* Lista de camiones */}
        <div style={{ marginTop: "20px" }}>
          <h3>Lista de Camiones ({filteredCamiones.length})</h3>

          {filteredCamiones.length === 0 ? (
            <p style={{ color: "#6c757d", fontStyle: "italic" }}>
              {searchTerm
                ? "No se encontraron camiones con esa búsqueda."
                : "No hay camiones registrados. Agregue uno usando el botón de arriba."}
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
                  <th style={tableHeaderStyle}>Placa</th>
                  <th style={tableHeaderStyle}>Marca</th>
                  <th style={tableHeaderStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCamiones.map((camion) => (
                  <tr
                    key={camion.id}
                    style={{
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    <td style={tableCellStyle}>{camion.placa}</td>
                    <td style={tableCellStyle}>{camion.marca}</td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => handleEdit(camion)}
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
                        onClick={() => handleDelete(camion)}
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

export default AdminCamiones;
