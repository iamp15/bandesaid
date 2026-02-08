import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PROVIDER_MAP } from "../../../constants/constants";
import { formatNumber } from "../../../utils/FormatNumber";
import { useAuth } from "../../login/AuthContext";
import "../../../styles/guias/DatosG4.css";
import LoadingSpinner from "../../LoadingSpinner";
import EditableField from "../../EditableField";
import { useNavigate } from "react-router-dom";
import { checkOnlineStatus } from "../../../utils/OnlineStatus";
import { useAlert } from "../../alert/AlertContext";
import { useEstados } from "../../../contexts/EstadosContext";

const DatosG4 = () => {
  const { cargaActual, proveedor, updateCargaField, currentCarga } =
    useEstados();
  const { loading, currentUser } = useAuth();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [onEdit, setOnEdit] = useState(null);
  const navigate = useNavigate();
  const { addAlert } = useAlert();
  const [numGuias, setNumGuias] = useState([]);
  const [pesosGuias, setPesosGuias] = useState([]);
  const [precintos, setPrecintos] = useState([]);
  const [showAddGuia, setShowAddGuia] = useState(false);
  const [showAddPrecinto, setShowAddPrecinto] = useState(false);
  const [editingGuiaIndex, setEditingGuiaIndex] = useState(null);
  const [editingPrecintoIndex, setEditingPrecintoIndex] = useState(null);
  const [draftCodigo, setDraftCodigo] = useState("");
  const [draftPeso, setDraftPeso] = useState("");
  const [draftPrecinto, setDraftPrecinto] = useState("");
  const key_prov = PROVIDER_MAP[proveedor];

  useEffect(() => {
    setNumGuias(currentCarga.codigos_guias || []);
    setPesosGuias(currentCarga.pesos_guias || []);
    setPrecintos(currentCarga.precintos || []);
  }, [currentCarga]);

  if (loading || !currentUser || !currentCarga || !currentCarga.id) {
    return <LoadingSpinner />;
  }

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  const parsePeso = (pesoStr) => {
    if (!pesoStr) return 0;
    const parts = String(pesoStr).split(",");
    if (parts.length > 1) {
      const integerPart = parts.slice(0, -1).join("").replace(/\./g, "");
      const decimalPart = parts[parts.length - 1];
      const finalValue = parseFloat(`${integerPart}.${decimalPart}`);
      return isNaN(finalValue) ? 0 : finalValue;
    }
    const finalValue = parseFloat(
      String(pesoStr).replace(/\./g, "").replace(",", ".")
    );
    return isNaN(finalValue) ? 0 : finalValue;
  };

  const checkPesos = () => {
    if (numGuias.length === 0) return true;
    const sumPesos =
      pesosGuias.reduce((acc, peso) => acc + parsePeso(peso), 0) || 0;
    const pesoTotal = parsePeso(currentCarga.p_total) || 0;

    if (Math.abs(sumPesos - pesoTotal) > 0.001) {
      addAlert(
        `La suma de los pesos de las guías (${sumPesos}) debe ser igual al peso total de la carga (${pesoTotal}).`,
        "error"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }

    if (onEdit) {
      addAlert("Por favor, guarda los cambios antes de continuar", "error");
      return;
    }

    if (!checkPesos()) {
      return;
    }

    navigate("/revisionguias");
  };

  const handleFieldSave = (fieldName, newValue) => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la información.",
        "error"
      );
      return;
    }
    const newData = {
      [fieldName]: newValue,
      editHistory: {
        ...currentCarga?.editHistory,
        [fieldName]: {
          value: newValue,
          editedBy: currentUser.name,
          editedAt: new Date().toISOString(),
        },
      },
    };
    updateCargaField(key_prov, currentCarga.id, newData);
  };

  const handleConfirmAddGuia = async () => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede agregar la guía.",
        "error"
      );
      return;
    }

    const codigo = String(draftCodigo).trim();
    const peso = String(draftPeso).trim();

    if (!codigo) {
      addAlert("El código de guía no puede estar vacío.", "error");
      return;
    }

    if (numGuias.some((c) => String(c).trim() === codigo)) {
      addAlert("Este código de guía ya está registrado.", "error");
      return;
    }

    if (!peso) {
      addAlert("El peso de la guía no puede estar vacío.", "error");
      return;
    }

    const newNumGuias = [...numGuias, codigo];
    const pesoFormateado = formatNumber(peso);
    const newPesosGuias = [...pesosGuias, pesoFormateado];

    setNumGuias(newNumGuias);
    setPesosGuias(newPesosGuias);
    setDraftCodigo("");
    setDraftPeso("");
    setShowAddGuia(false);

    try {
      await updateCargaField(key_prov, currentCarga.id, {
        codigos_guias: newNumGuias,
        pesos_guias: newPesosGuias,
      });
      addAlert("Guía agregada correctamente.", "success");
    } catch (error) {
      setNumGuias(numGuias);
      setPesosGuias(pesosGuias);
      setDraftCodigo(codigo);
      setDraftPeso(peso);
      addAlert(
        "Error al guardar la guía. Verifique su conexión e intente de nuevo.",
        "error"
      );
    }
  };

  const handleCancelAddGuia = () => {
    setShowAddGuia(false);
    setEditingGuiaIndex(null);
    setDraftCodigo("");
    setDraftPeso("");
  };

  const handleEditGuia = (idx) => {
    setEditingGuiaIndex(idx);
    setDraftCodigo(numGuias[idx] || "");
    setDraftPeso(pesosGuias[idx] || "");
  };

  const handleSaveEditGuia = async () => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar la guía.",
        "error"
      );
      return;
    }
    if (editingGuiaIndex === null) return;

    const codigo = String(draftCodigo).trim();
    const peso = String(draftPeso).trim();

    if (!codigo) {
      addAlert("El código de guía no puede estar vacío.", "error");
      return;
    }

    const otroIndexConMismoCodigo = numGuias.findIndex(
      (c, i) => i !== editingGuiaIndex && String(c).trim() === codigo
    );
    if (otroIndexConMismoCodigo >= 0) {
      addAlert("Este código de guía ya existe.", "error");
      return;
    }

    if (!peso) {
      addAlert("El peso de la guía no puede estar vacío.", "error");
      return;
    }

    const newNumGuias = [...numGuias];
    const newPesosGuias = [...pesosGuias];
    newNumGuias[editingGuiaIndex] = codigo;
    newPesosGuias[editingGuiaIndex] = formatNumber(peso);

    const prevNumGuias = [...numGuias];
    const prevPesosGuias = [...pesosGuias];

    setNumGuias(newNumGuias);
    setPesosGuias(newPesosGuias);
    setEditingGuiaIndex(null);
    setDraftCodigo("");
    setDraftPeso("");

    try {
      await updateCargaField(key_prov, currentCarga.id, {
        codigos_guias: newNumGuias,
        pesos_guias: newPesosGuias,
      });
      addAlert("Guía actualizada correctamente.", "success");
    } catch (error) {
      setNumGuias(prevNumGuias);
      setPesosGuias(prevPesosGuias);
      setEditingGuiaIndex(null);
      addAlert(
        "Error al guardar la guía. Verifique su conexión e intente de nuevo.",
        "error"
      );
    }
  };

  const handleDeleteGuia = async (idx) => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede eliminar la guía.",
        "error"
      );
      return;
    }

    const newNumGuias = numGuias.filter((_, i) => i !== idx);
    const newPesosGuias = pesosGuias.filter((_, i) => i !== idx);

    const prevNumGuias = [...numGuias];
    const prevPesosGuias = [...pesosGuias];

    setNumGuias(newNumGuias);
    setPesosGuias(newPesosGuias);

    try {
      await updateCargaField(key_prov, currentCarga.id, {
        codigos_guias: newNumGuias.length > 0 ? newNumGuias : [],
        pesos_guias: newPesosGuias.length > 0 ? newPesosGuias : [],
      });
      addAlert("Guía eliminada correctamente.", "success");
    } catch (error) {
      setNumGuias(prevNumGuias);
      setPesosGuias(prevPesosGuias);
      addAlert(
        "Error al eliminar la guía. Verifique su conexión e intente de nuevo.",
        "error"
      );
    }
  };

  const handleConfirmAddPrecinto = async () => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede agregar el precinto.",
        "error"
      );
      return;
    }

    const codigo = String(draftPrecinto).trim();

    if (!codigo) {
      addAlert("El código de precinto no puede estar vacío.", "error");
      return;
    }

    const newPrecintos = [...precintos, codigo];

    setPrecintos(newPrecintos);
    setDraftPrecinto("");
    setShowAddPrecinto(false);

    try {
      await updateCargaField(key_prov, currentCarga.id, {
        precintos: newPrecintos,
      });
      addAlert("Precinto agregado correctamente.", "success");
    } catch (error) {
      setPrecintos(precintos);
      setDraftPrecinto(codigo);
      addAlert(
        "Error al guardar el precinto. Verifique su conexión e intente de nuevo.",
        "error"
      );
    }
  };

  const handleCancelAddPrecinto = () => {
    setShowAddPrecinto(false);
    setEditingPrecintoIndex(null);
    setDraftPrecinto("");
  };

  const handleEditPrecinto = (idx) => {
    setEditingPrecintoIndex(idx);
    setDraftPrecinto(precintos[idx] || "");
  };

  const handleSaveEditPrecinto = async () => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede guardar el precinto.",
        "error"
      );
      return;
    }
    if (editingPrecintoIndex === null) return;

    const codigo = String(draftPrecinto).trim();

    if (!codigo) {
      addAlert("El código de precinto no puede estar vacío.", "error");
      return;
    }

    const newPrecintos = [...precintos];
    newPrecintos[editingPrecintoIndex] = codigo;

    const prevPrecintos = [...precintos];

    setPrecintos(newPrecintos);
    setEditingPrecintoIndex(null);
    setDraftPrecinto("");

    try {
      await updateCargaField(key_prov, currentCarga.id, {
        precintos: newPrecintos,
      });
      addAlert("Precinto actualizado correctamente.", "success");
    } catch (error) {
      setPrecintos(prevPrecintos);
      setEditingPrecintoIndex(null);
      addAlert(
        "Error al guardar el precinto. Verifique su conexión e intente de nuevo.",
        "error"
      );
    }
  };

  const handleDeletePrecinto = async (idx) => {
    if (!checkOnlineStatus()) {
      addAlert(
        "No hay conexión a internet. No se puede eliminar el precinto.",
        "error"
      );
      return;
    }

    const newPrecintos = precintos.filter((_, i) => i !== idx);
    const prevPrecintos = [...precintos];

    setPrecintos(newPrecintos.length > 0 ? newPrecintos : []);

    try {
      await updateCargaField(key_prov, currentCarga.id, {
        precintos: newPrecintos.length > 0 ? newPrecintos : [],
      });
      addAlert("Precinto eliminado correctamente.", "success");
    } catch (error) {
      setPrecintos(prevPrecintos);
      addAlert(
        "Error al eliminar el precinto. Verifique su conexión e intente de nuevo.",
        "error"
      );
    }
  };

  if (showSuggestions) true;

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          {/* Datos Guía */}
          <div className="section-g4">
            <h2>Datos Guía</h2>

            {numGuias.length > 0 && (
              <div className="lista-guias">
                {numGuias.map((codigo, idx) => (
                  <div key={idx} className="lista-item">
                    <span className="lista-item-text">
                      Guía {idx + 1}: {codigo}
                      {pesosGuias[idx] && ` - ${pesosGuias[idx]} kg`}
                    </span>
                    <div className="lista-item-actions">
                      <button
                        type="button"
                        className="btn-editar"
                        onClick={() => handleEditGuia(idx)}
                        title="Editar guía"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-eliminar"
                        onClick={() => handleDeleteGuia(idx)}
                        title="Eliminar guía"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAddGuia || editingGuiaIndex !== null ? (
              <div className="inline-add-form">
                <label>Código de guía (9 dígitos):</label>
                <input
                  type="text"
                  maxLength={9}
                  value={draftCodigo}
                  onChange={(e) => setDraftCodigo(e.target.value)}
                  placeholder="Ingrese código de guía"
                />
                <label>Peso de la guía:</label>
                <input
                  type="text"
                  value={draftPeso}
                  onChange={(e) => setDraftPeso(e.target.value)}
                  placeholder="Ingrese peso"
                />
                <div className="inline-add-buttons">
                  <button
                    type="button"
                    onClick={
                      editingGuiaIndex !== null
                        ? handleSaveEditGuia
                        : handleConfirmAddGuia
                    }
                    className="btn-agregar"
                  >
                    {editingGuiaIndex !== null ? "Guardar" : "Agregar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAddGuia}
                    className="btn-cancelar"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn-agregar-guia-precinto"
                onClick={() => setShowAddGuia(true)}
              >
                + Agregar guía
              </button>
            )}
          </div>

          {/* Datos Precintos */}
          <div className="section-g4">
            <h2>Datos Precintos</h2>

            {precintos.length > 0 && (
              <div className="lista-precintos">
                {precintos.map((codigo, idx) => (
                  <div key={idx} className="lista-item">
                    <span className="lista-item-text">
                      Precinto {idx + 1}: {codigo}
                    </span>
                    <div className="lista-item-actions">
                      <button
                        type="button"
                        className="btn-editar"
                        onClick={() => handleEditPrecinto(idx)}
                        title="Editar precinto"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-eliminar"
                        onClick={() => handleDeletePrecinto(idx)}
                        title="Eliminar precinto"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAddPrecinto || editingPrecintoIndex !== null ? (
              <div className="inline-add-form">
                <label>Código de precinto (max 8 caracteres):</label>
                <input
                  type="text"
                  maxLength={8}
                  value={draftPrecinto}
                  onChange={(e) => setDraftPrecinto(e.target.value)}
                  placeholder="Ingrese código de precinto"
                />
                <div className="inline-add-buttons">
                  <button
                    type="button"
                    onClick={
                      editingPrecintoIndex !== null
                        ? handleSaveEditPrecinto
                        : handleConfirmAddPrecinto
                    }
                    className="btn-agregar"
                  >
                    {editingPrecintoIndex !== null ? "Guardar" : "Agregar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAddPrecinto}
                    className="btn-cancelar"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn-agregar-guia-precinto"
                onClick={() => setShowAddPrecinto(true)}
              >
                + Agregar precinto
              </button>
            )}
          </div>

          <EditableField
            fieldName="id_despacho"
            label="ID despacho"
            value={currentCarga.id_despacho}
            onSave={handleFieldSave}
            placeholder={"Ingresa el ID del despacho"}
            currentUser={currentUser}
            editHistory={currentCarga.editHistory}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
            setShowSuggestions={setShowSuggestions}
          />

          <div className="button-group">
            <Link to={"/datosg3"}>
              <button type="button">Atras</button>
            </Link>
            <button type="submit">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DatosG4;
