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
import { codigos_espejo as companyNames } from "../../../constants/CodigosEspejo";
import { sinCodigo } from "../../../constants/Sincodigo";

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
  const [draftDestinoGuia, setDraftDestinoGuia] = useState("");
  const [draftEstadoDestinoGuia, setDraftEstadoDestinoGuia] = useState("");
  const [draftCodigoEspejoGuia, setDraftCodigoEspejoGuia] = useState("");
  const [draftTransporteGuia, setDraftTransporteGuia] = useState("");
  const [draftPrecinto, setDraftPrecinto] = useState("");
  const key_prov = PROVIDER_MAP[proveedor];

  const [destinosDiferentesPorGuia, setDestinosDiferentesPorGuia] = useState(
    () => currentCarga?.destinos_diferentes_por_guia === true
  );
  const [destinosGuias, setDestinosGuias] = useState([]);
  const [estadosDestinoGuias, setEstadosDestinoGuias] = useState([]);
  const [codigosEspejoGuias, setCodigosEspejoGuias] = useState([]);
  const [transportesGuias, setTransportesGuias] = useState([]);
  const [suggestionGuiaIndex, setSuggestionGuiaIndex] = useState(null);
  const [suggestionsList, setSuggestionsList] = useState([]);

  useEffect(() => {
    setNumGuias(currentCarga.codigos_guias || []);
    setPesosGuias(currentCarga.pesos_guias || []);
    setPrecintos(currentCarga.precintos || []);
    setDestinosDiferentesPorGuia(currentCarga?.destinos_diferentes_por_guia === true);
    const codigos = currentCarga.codigos_guias || [];
    const n = codigos.length;
    if (n === 0) {
      setDestinosGuias([]);
      setEstadosDestinoGuias([]);
      setCodigosEspejoGuias([]);
      setTransportesGuias([]);
    } else if (currentCarga.destinos_diferentes_por_guia && currentCarga.destinos_guias?.length === n) {
      setDestinosGuias(currentCarga.destinos_guias);
      setEstadosDestinoGuias(currentCarga.estados_destino_guias || Array(n).fill(""));
      setCodigosEspejoGuias(currentCarga.codigos_espejo_guias || Array(n).fill(""));
      setTransportesGuias(currentCarga.transportes_guias || Array(n).fill(""));
    } else {
      const destinosBase = currentCarga.destinos_guias?.length ? currentCarga.destinos_guias.slice(0, n) : [];
      const estadosBase = currentCarga.estados_destino_guias?.length ? currentCarga.estados_destino_guias.slice(0, n) : [];
      const codigosBase = currentCarga.codigos_espejo_guias?.length ? currentCarga.codigos_espejo_guias.slice(0, n) : [];
      const transportesBase = currentCarga.transportes_guias?.length ? currentCarga.transportes_guias.slice(0, n) : [];
      while (destinosBase.length < n) destinosBase.push(currentCarga.destino || "");
      while (estadosBase.length < n) estadosBase.push(currentCarga.estadoDestino || "");
      while (codigosBase.length < n) codigosBase.push(currentCarga.codigo_espejo || "");
      while (transportesBase.length < n) transportesBase.push(currentCarga.transporte || "");
      setDestinosGuias(destinosBase);
      setEstadosDestinoGuias(estadosBase);
      setCodigosEspejoGuias(codigosBase);
      setTransportesGuias(transportesBase);
    }
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

  const getRelevanceData = (companyName, searchValue, searchWords) => {
    const nameLower = companyName.toLowerCase().replace(/\s+/g, " ");
    const searchNorm = searchValue.replace(/\s+/g, " ");
    if (nameLower === searchNorm) return { score: 10000, phraseIndex: 0 };
    if (nameLower.startsWith(searchNorm)) return { score: 9000, phraseIndex: 0 };
    const phraseIdx = nameLower.indexOf(searchNorm);
    if (phraseIdx >= 0) return { score: 8000, phraseIndex: phraseIdx };
    const wordMatches = searchWords.filter((w) => nameLower.includes(w));
    if (wordMatches.length !== searchWords.length) return { score: 0, phraseIndex: 9999 };
    let score = 400;
    const indices = searchWords.map((w) => nameLower.indexOf(w)).sort((a, b) => a - b);
    const span = indices[indices.length - 1] - indices[0];
    score += Math.max(0, 200 - span);
    if (nameLower.startsWith(searchWords[0])) score += 150;
    if (nameLower.length < 60) score += 20;
    return { score, phraseIndex: indices[0] };
  };

  const handleSelectDestinoDraft = (company) => {
    setDraftDestinoGuia(company.nombre);
    setDraftEstadoDestinoGuia(
      company.estado && String(company.estado).toUpperCase() !== "N/A"
        ? company.estado
        : ""
    );
    setDraftCodigoEspejoGuia(company.codigo != null ? String(company.codigo) : "");
    setDraftTransporteGuia(company.entidad && company.entidad !== "" ? company.entidad : "");
    setSuggestionGuiaIndex(null);
    setSuggestionsList([]);
  };

  const handleDestinosDiferentesChange = async (e) => {
    const checked = e.target.checked;
    setDestinosDiferentesPorGuia(checked);
    if (!checkOnlineStatus()) return;
    const n = numGuias.length;
    const payload = { destinos_diferentes_por_guia: checked };
    if (checked && n > 0) {
      const destinos = destinosGuias.length === n ? destinosGuias : Array(n).fill(currentCarga.destino || "");
      const estados = estadosDestinoGuias.length === n ? estadosDestinoGuias : Array(n).fill(currentCarga.estadoDestino || "");
      const codigos = codigosEspejoGuias.length === n ? codigosEspejoGuias : Array(n).fill(currentCarga.codigo_espejo || "");
      const transportes = transportesGuias.length === n ? transportesGuias : Array(n).fill(currentCarga.transporte || "");
      payload.destinos_guias = destinos;
      payload.estados_destino_guias = estados;
      payload.codigos_espejo_guias = codigos;
      payload.transportes_guias = transportes;
      setDestinosGuias(destinos);
      setEstadosDestinoGuias(estados);
      setCodigosEspejoGuias(codigos);
      setTransportesGuias(transportes);
    }
    try {
      await updateCargaField(key_prov, currentCarga.id, payload);
    } catch (err) {
      setDestinosDiferentesPorGuia(!checked);
    }
  };

  const handleDestinoInputDraft = (e) => {
    if (editingGuiaIndex === null) return;
    const value = e.target.value.toLowerCase().trim().replace(/\s+/g, " ");
    const searchWords = value.split(/\s+/).filter(Boolean);
    if (searchWords.length === 0) {
      setSuggestionGuiaIndex(null);
      setSuggestionsList([]);
      return;
    }
    const allCompanies = [...companyNames.map((c) => ({ ...c })), ...sinCodigo.map((c) => ({ ...c }))];
    const filtered = allCompanies.filter((company) =>
      searchWords.every((word) => company.nombre.toLowerCase().includes(word))
    );
    const sorted = [...filtered].sort((a, b) => {
      const dataA = getRelevanceData(a.nombre, value, searchWords);
      const dataB = getRelevanceData(b.nombre, value, searchWords);
      if (dataB.score !== dataA.score) return dataB.score - dataA.score;
      if (dataA.phraseIndex !== dataB.phraseIndex) return dataA.phraseIndex - dataB.phraseIndex;
      return a.nombre.length - b.nombre.length;
    });
    setSuggestionGuiaIndex(editingGuiaIndex);
    setSuggestionsList(sorted.slice(0, 15));
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
    let payload = { codigos_guias: newNumGuias, pesos_guias: newPesosGuias };
    if (destinosDiferentesPorGuia) {
      const newDestinos = [...destinosGuias, currentCarga.destino || ""];
      const newEstados = [...estadosDestinoGuias, currentCarga.estadoDestino || ""];
      const newCodigos = [...codigosEspejoGuias, currentCarga.codigo_espejo || ""];
      const newTransportes = [...transportesGuias, currentCarga.transporte || ""];
      payload = { ...payload, destinos_guias: newDestinos, estados_destino_guias: newEstados, codigos_espejo_guias: newCodigos, transportes_guias: newTransportes };
      setDestinosGuias(newDestinos);
      setEstadosDestinoGuias(newEstados);
      setCodigosEspejoGuias(newCodigos);
      setTransportesGuias(newTransportes);
    }

    setNumGuias(newNumGuias);
    setPesosGuias(newPesosGuias);
    setDraftCodigo("");
    setDraftPeso("");
    setShowAddGuia(false);

    try {
      await updateCargaField(key_prov, currentCarga.id, payload);
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
    setDraftDestinoGuia("");
    setDraftEstadoDestinoGuia("");
    setDraftCodigoEspejoGuia("");
    setDraftTransporteGuia("");
    setSuggestionGuiaIndex(null);
    setSuggestionsList([]);
  };

  const handleEditGuia = (idx) => {
    setShowAddGuia(false);
    setEditingGuiaIndex(idx);
    setDraftCodigo(numGuias[idx] || "");
    setDraftPeso(pesosGuias[idx] || "");
    setDraftDestinoGuia(destinosGuias[idx] ?? "");
    setDraftEstadoDestinoGuia(estadosDestinoGuias[idx] ?? "");
    setDraftCodigoEspejoGuia(codigosEspejoGuias[idx] ?? "");
    setDraftTransporteGuia(transportesGuias[idx] ?? "");
    setSuggestionGuiaIndex(null);
    setSuggestionsList([]);
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

    const idxSave = editingGuiaIndex;
    const codigo = String(draftCodigo).trim();
    const peso = String(draftPeso).trim();

    if (!codigo) {
      addAlert("El código de guía no puede estar vacío.", "error");
      return;
    }

    const otroIndexConMismoCodigo = numGuias.findIndex(
      (c, i) => i !== idxSave && String(c).trim() === codigo
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
    newNumGuias[idxSave] = codigo;
    newPesosGuias[idxSave] = formatNumber(peso);

    const prevNumGuias = [...numGuias];
    const prevPesosGuias = [...pesosGuias];
    const prevDestinosGuias = destinosDiferentesPorGuia ? [...destinosGuias] : null;
    const prevEstadosDestinoGuias = destinosDiferentesPorGuia ? [...estadosDestinoGuias] : null;
    const prevCodigosEspejoGuias = destinosDiferentesPorGuia ? [...codigosEspejoGuias] : null;
    const prevTransportesGuias = destinosDiferentesPorGuia ? [...transportesGuias] : null;

    let payload = { codigos_guias: newNumGuias, pesos_guias: newPesosGuias };
    if (destinosDiferentesPorGuia) {
      const newDestinos = [...destinosGuias];
      const newEstados = [...estadosDestinoGuias];
      const newCodigos = [...codigosEspejoGuias];
      const newTransportes = [...transportesGuias];
      newDestinos[idxSave] = String(draftDestinoGuia ?? "").trim();
      newEstados[idxSave] = String(draftEstadoDestinoGuia ?? "").trim();
      newCodigos[idxSave] = String(draftCodigoEspejoGuia ?? "").trim();
      newTransportes[idxSave] = String(draftTransporteGuia ?? "").trim();
      payload = {
        ...payload,
        destinos_guias: newDestinos,
        estados_destino_guias: newEstados,
        codigos_espejo_guias: newCodigos,
        transportes_guias: newTransportes,
      };
      setDestinosGuias(newDestinos);
      setEstadosDestinoGuias(newEstados);
      setCodigosEspejoGuias(newCodigos);
      setTransportesGuias(newTransportes);
    }

    setNumGuias(newNumGuias);
    setPesosGuias(newPesosGuias);
    setEditingGuiaIndex(null);
    setDraftCodigo("");
    setDraftPeso("");
    setDraftDestinoGuia("");
    setDraftEstadoDestinoGuia("");
    setDraftCodigoEspejoGuia("");
    setDraftTransporteGuia("");
    setSuggestionGuiaIndex(null);
    setSuggestionsList([]);

    try {
      await updateCargaField(key_prov, currentCarga.id, payload);
      addAlert("Guía actualizada correctamente.", "success");
    } catch (error) {
      setNumGuias(prevNumGuias);
      setPesosGuias(prevPesosGuias);
      if (prevDestinosGuias) {
        setDestinosGuias(prevDestinosGuias);
        setEstadosDestinoGuias(prevEstadosDestinoGuias);
        setCodigosEspejoGuias(prevCodigosEspejoGuias);
        setTransportesGuias(prevTransportesGuias);
      }
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
    const newDestinosGuias = destinosGuias.filter((_, i) => i !== idx);
    const newEstadosDestinoGuias = estadosDestinoGuias.filter((_, i) => i !== idx);
    const newCodigosEspejoGuias = codigosEspejoGuias.filter((_, i) => i !== idx);
    const newTransportesGuias = transportesGuias.filter((_, i) => i !== idx);

    const prevNumGuias = [...numGuias];
    const prevPesosGuias = [...pesosGuias];

    setNumGuias(newNumGuias);
    setPesosGuias(newPesosGuias);
    setDestinosGuias(newDestinosGuias);
    setEstadosDestinoGuias(newEstadosDestinoGuias);
    setCodigosEspejoGuias(newCodigosEspejoGuias);
    setTransportesGuias(newTransportesGuias);

    const payload = {
      codigos_guias: newNumGuias.length > 0 ? newNumGuias : [],
      pesos_guias: newPesosGuias.length > 0 ? newPesosGuias : [],
    };
    if (destinosDiferentesPorGuia) {
      payload.destinos_guias = newDestinosGuias;
      payload.estados_destino_guias = newEstadosDestinoGuias;
      payload.codigos_espejo_guias = newCodigosEspejoGuias;
      payload.transportes_guias = newTransportesGuias;
    }
    try {
      await updateCargaField(key_prov, currentCarga.id, payload);
      addAlert("Guía eliminada correctamente.", "success");
    } catch (error) {
      setNumGuias(prevNumGuias);
      setPesosGuias(prevPesosGuias);
      setDestinosGuias(destinosGuias);
      setEstadosDestinoGuias(estadosDestinoGuias);
      setCodigosEspejoGuias(codigosEspejoGuias);
      setTransportesGuias(transportesGuias);
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

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          {/* Datos Guía */}
          <div className="section-g4">
            <h2>Datos Guía</h2>

            {numGuias.length > 1 && (
              <div className="checkbox-destinos-guias">
                <label>
                  <input
                    type="checkbox"
                    checked={destinosDiferentesPorGuia}
                    onChange={handleDestinosDiferentesChange}
                  />
                  Las guías tienen destinos diferentes
                </label>
              </div>
            )}
            {numGuias.length > 0 && (
              <div className="lista-guias">
                {numGuias.map((codigo, idx) => (
                  <div key={idx} className="lista-guia-bloque">
                    <div className="lista-item">
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
                      {destinosDiferentesPorGuia && (
                        <div className="destino-guia-display">
                          <span>
                            Entidad destino:{" "}
                            {destinosGuias[idx] != null &&
                            String(destinosGuias[idx]).trim() !== ""
                              ? destinosGuias[idx]
                              : "No registrado"}
                          </span>
                          <span>
                            Estado destino:{" "}
                            {estadosDestinoGuias[idx] != null &&
                            String(estadosDestinoGuias[idx]).trim() !== ""
                              ? estadosDestinoGuias[idx]
                              : "No registrado"}
                          </span>
                        </div>
                      )}
                    </div>
                    {editingGuiaIndex === idx && (
                      <div className="inline-add-form guia-edit-inline">
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
                        {destinosDiferentesPorGuia && (
                          <>
                            <div className="destino-guia-input-wrap">
                              <label>Entidad destino</label>
                              <input
                                type="text"
                                value={draftDestinoGuia}
                                onChange={(e) => {
                                  setDraftDestinoGuia(e.target.value);
                                  handleDestinoInputDraft(e);
                                }}
                                onFocus={() =>
                                  handleDestinoInputDraft({
                                    target: { value: draftDestinoGuia ?? "" },
                                  })
                                }
                                onBlur={() =>
                                  setTimeout(() => {
                                    setSuggestionGuiaIndex(null);
                                    setSuggestionsList([]);
                                  }, 200)
                                }
                                placeholder="Escribe el nombre de la empresa"
                                autoComplete="off"
                              />
                              {suggestionGuiaIndex === editingGuiaIndex &&
                                suggestionsList.length > 0 && (
                                  <ul className="destino-suggestions">
                                    {suggestionsList.map((c, i) => (
                                      <li
                                        key={i}
                                        role="button"
                                        tabIndex={0}
                                        onMouseDown={() => handleSelectDestinoDraft(c)}
                                        onKeyDown={(e) =>
                                          e.key === "Enter" && handleSelectDestinoDraft(c)
                                        }
                                      >
                                        {c.nombre}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </div>
                            <div className="destino-guia-input-wrap">
                              <label>Estado destino</label>
                              <input
                                type="text"
                                value={draftEstadoDestinoGuia}
                                onChange={(e) =>
                                  setDraftEstadoDestinoGuia(e.target.value)
                                }
                                placeholder="Estado"
                              />
                            </div>
                          </>
                        )}
                        <div className="inline-add-buttons">
                          <button
                            type="button"
                            onClick={handleCancelAddGuia}
                            className="btn-cancelar"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEditGuia}
                            className="btn-agregar"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showAddGuia && editingGuiaIndex === null ? (
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
                    onClick={handleCancelAddGuia}
                    className="btn-cancelar"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAddGuia}
                    className="btn-agregar"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ) : (
              editingGuiaIndex === null && (
                <button
                  type="button"
                  className="btn-agregar-guia-precinto"
                  onClick={() => {
                    setEditingGuiaIndex(null);
                    setDraftDestinoGuia("");
                    setDraftEstadoDestinoGuia("");
                    setDraftCodigoEspejoGuia("");
                    setDraftTransporteGuia("");
                    setSuggestionGuiaIndex(null);
                    setSuggestionsList([]);
                    setShowAddGuia(true);
                  }}
                >
                  + Agregar guía
                </button>
              )
            )}
          </div>

          <hr className="section-divider" />

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
                    onClick={handleCancelAddPrecinto}
                    className="btn-cancelar"
                  >
                    Cancelar
                  </button>
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

          <hr className="section-divider" />

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
