import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { processHtmlManually } from "../../utils/scrapeGuiaSADA";
import { compareGuiaSADA } from "../../utils/compareGuiaSADA";
import { validarDatosParaAnclajes } from "../../utils/validarDatosAnclajes";
import { useEstados } from "../../contexts/EstadosContext";
import { useAlert } from "../alert/AlertContext";
import { useAuth } from "../login/AuthContext";
import LoadingSpinner from "../LoadingSpinner";
import { PROVIDER_MAP } from "../../constants/constants";
import "../../styles/qr/QRScanner.css";

/**
 * Formatea una cédula con separador de miles usando punto
 * @param {string|number} cedula - Cédula a formatear
 * @returns {string} - Cédula formateada (ej: 18.233.632)
 */
const formatCedula = (cedula) => {
  if (!cedula) return "";
  // Remover cualquier carácter no numérico
  const numeros = String(cedula).replace(/\D/g, "");
  if (!numeros) return "";
  // Agregar puntos como separador de miles
  return numeros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Formatea una fecha al formato dd/mm/aaaa
 * @param {string} fecha - Fecha en cualquier formato
 * @returns {string} - Fecha formateada (ej: 26/01/2026)
 */
const formatFecha = (fecha) => {
  if (!fecha) return "";
  
  // Intentar parsear diferentes formatos de fecha
  const fechaStr = String(fecha).trim();
  
  // Si ya está en formato dd/mm/aaaa, retornarlo
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaStr)) {
    return fechaStr;
  }
  
  // Intentar parsear formato dd-mm-aaaa o dd/mm/aaaa
  const match1 = fechaStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (match1) {
    const dia = match1[1].padStart(2, "0");
    const mes = match1[2].padStart(2, "0");
    let año = match1[3];
    // Si el año tiene 2 dígitos, asumir 20xx
    if (año.length === 2) {
      año = "20" + año;
    }
    return `${dia}/${mes}/${año}`;
  }
  
  // Intentar parsear formato aaaa-mm-dd
  const match2 = fechaStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match2) {
    const año = match2[1];
    const mes = match2[2].padStart(2, "0");
    const dia = match2[3].padStart(2, "0");
    return `${dia}/${mes}/${año}`;
  }
  
  // Si no se puede parsear, retornar la fecha original
  return fechaStr;
};

const ScannerGuiaSADA = () => {
  const { currentCarga, proveedor } = useEstados();
  const { addAlert } = useAlert();
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const key_prov = PROVIDER_MAP[proveedor];

  const [loading, setLoading] = useState(false);
  const [datosExtraidos, setDatosExtraidos] = useState(null);
  const [comparacion, setComparacion] = useState(null);
  const [guiasEscaneadas, setGuiasEscaneadas] = useState([]);
  const [mostrarComparacion, setMostrarComparacion] = useState(false);
  const [manualHtml, setManualHtml] = useState("");

  useEffect(() => {
    if (!currentCarga || !currentCarga.id) {
      addAlert("Debe seleccionar una carga primero", "error");
      navigate("/carga");
    }
  }, [currentCarga, navigate, addAlert]);

  if (authLoading || !currentUser || !currentCarga || !currentCarga.id) {
    return <LoadingSpinner />;
  }

  if (!proveedor) {
    navigate("/despachos");
    return null;
  }


  const handleManualHtmlSubmit = async () => {
    if (!manualHtml || manualHtml.trim().length === 0) {
      addAlert("Por favor, pegue el HTML de la guía SADA", "error");
      return;
    }

    setLoading(true);
    try {
      // Procesar HTML manualmente
      const datos = processHtmlManually(manualHtml);
      setDatosExtraidos(datos);

      // Verificar si el número de guía ya existe
      const codigosGuias = currentCarga.codigos_guias || [];
      const existeGuia = codigosGuias.some(
        (codigo) => String(codigo).trim() === String(datos.numeroGuia).trim()
      );

      // Comparar con datos actuales
      const comparacionResult = compareGuiaSADA(datos, currentCarga);
      setComparacion(comparacionResult);

      // Agregar a lista de guías escaneadas
      const nuevaGuia = {
        numeroGuia: datos.numeroGuia,
        cantidadRubros: datos.cantidadRubrosFormateado,
        url: "HTML manual",
        timestamp: new Date().toISOString(),
      };
      setGuiasEscaneadas((prev) => [...prev, nuevaGuia]);

      // Mostrar comparación
      setMostrarComparacion(true);
      setManualHtml("");
    } catch (error) {
      console.error("Error al procesar HTML manual:", error);
      addAlert(error.message || "Error al procesar el HTML", "error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="scanner-guia-container">
      <div className="wrap-container">
        <div className="menu">
          <div className="scanner-page-header">
            <h2>Procesar Guía SADA</h2>
            <button
              type="button"
              onClick={() => navigate("/revisionguias")}
              className="btn-volver-html"
            >
              ← Volver a Verificación de datos
            </button>
          </div>

          {!mostrarComparacion ? (
            <>
              <div className="manual-html-container" style={{
                padding: "20px",
                margin: "20px 0",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}>
                {/* Campo para pegar HTML */}
                <label htmlFor="manual-html" style={{ 
                  display: "block", 
                  marginBottom: "8px",
                  fontWeight: "bold"
                }}>
                  Pegue el HTML o código fuente aquí:
                </label>
                <textarea
                  id="manual-html"
                  value={manualHtml}
                  onChange={(e) => setManualHtml(e.target.value)}
                  placeholder="Pegue aquí el HTML completo o el código fuente de la página de la guía SADA..."
                  style={{
                    width: "100%",
                    minHeight: "250px",
                    padding: "10px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    marginBottom: "15px",
                    resize: "vertical",
                  }}
                />
                <div style={{ 
                  display: "flex", 
                  gap: "10px",
                  flexWrap: "wrap"
                }}>
                  <button
                    onClick={handleManualHtmlSubmit}
                    className="btn-primary"
                    disabled={loading || !manualHtml.trim()}
                    style={{ flex: "1", minWidth: "120px" }}
                  >
                    {loading ? "Procesando..." : "Procesar HTML"}
                  </button>
                  <button
                    onClick={() => {
                      setManualHtml("");
                    }}
                    className="btn-secondary"
                    style={{ flex: "1", minWidth: "120px" }}
                  >
                    Limpiar
                  </button>
                </div>
                {manualHtml.trim().length > 0 && (
                  <p style={{ 
                    marginTop: "10px", 
                    fontSize: "12px", 
                    color: "#666",
                    textAlign: "center"
                  }}>
                    ✓ {manualHtml.length} caracteres listos para procesar
                  </p>
                )}
              </div>

              {loading && <LoadingSpinner />}

              {guiasEscaneadas.length > 0 && (
                <div className="guias-escaneadas">
                  <h3>Guías escaneadas en esta sesión:</h3>
                  <ul>
                    {guiasEscaneadas.map((guia, index) => (
                      <li key={index}>
                        Guía: {guia.numeroGuia} - Peso: {guia.cantidadRubros} Kg
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      setMostrarComparacion(false);
                      setDatosExtraidos(null);
                      setComparacion(null);
                    }}
                    className="btn-secondary"
                  >
                    Procesar otra guía
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="comparacion-container">
              <div className="comparacion-header">
                <h3>Comparación de Datos</h3>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarComparacion(false);
                    setDatosExtraidos(null);
                    setComparacion(null);
                  }}
                  className="btn-volver-html"
                >
                  ← Volver a pegar HTML
                </button>
              </div>

              {comparacion && (
                <div className="comparacion-results">
                  {/* Número de guía - Siempre mostrar */}
                  <div
                    className={`comparacion-item ${
                      comparacion.numeroGuia.coincide ? "coincide" : "difiere"
                    }`}
                  >
                    <div className="campo-label">
                      Número de guía
                      {comparacion.numeroGuia.coincide ? (
                        <span className="indicador-ok"> ✓</span>
                      ) : (
                        <span className="indicador-error"> ✗</span>
                      )}
                    </div>
                    <div className="valores">
                      <div className="valor-extraido">
                        Guía SADA: {comparacion.numeroGuia.valorExtraido || "(no encontrado)"}
                      </div>
                      <div className="valor-manual">
                        Manual:{" "}
                        {Array.isArray(comparacion.numeroGuia.valorManual)
                          ? comparacion.numeroGuia.valorManual.join(", ")
                          : comparacion.numeroGuia.valorManual || "(vacío)"}
                      </div>
                    </div>
                  </div>

                  {/* Conductor - Siempre mostrar */}
                  <div
                    className={`comparacion-item ${
                      comparacion.conductor.coincide ? "coincide" : "difiere"
                    }`}
                  >
                    <div className="campo-label">
                      Conductor
                      {comparacion.conductor.coincide ? (
                        <span className="indicador-ok"> ✓</span>
                      ) : (
                        <span className="indicador-error"> ✗</span>
                      )}
                    </div>
                    <div className="valores">
                      <div className="valor-extraido">
                        Guía SADA: {comparacion.conductor.valorExtraido || "(no encontrado)"}
                      </div>
                      <div className="valor-manual">
                        Manual: {comparacion.conductor.valorManual || "(vacío)"}
                      </div>
                    </div>
                  </div>

                  {/* Cédula del conductor - Siempre mostrar */}
                  <div
                    className={`comparacion-item ${
                      comparacion.cedula?.coincide ? "coincide" : "difiere"
                    }`}
                  >
                    <div className="campo-label">
                      Cédula del conductor
                      {comparacion.cedula?.coincide ? (
                        <span className="indicador-ok"> ✓</span>
                      ) : (
                        <span className="indicador-error"> ✗</span>
                      )}
                    </div>
                    <div className="valores">
                      <div className="valor-extraido">
                        Guía SADA: {comparacion.cedula?.valorExtraido 
                          ? formatCedula(comparacion.cedula.valorExtraido) 
                          : "(no encontrado)"}
                      </div>
                      <div className="valor-manual">
                        Manual: {comparacion.cedula?.valorManual 
                          ? formatCedula(comparacion.cedula.valorManual) 
                          : "(vacío)"}
                      </div>
                    </div>
                  </div>

                  {/* Placa - Siempre mostrar */}
                  <div
                    className={`comparacion-item ${
                      comparacion.placa.coincide ? "coincide" : "difiere"
                    }`}
                  >
                    <div className="campo-label">
                      Placa
                      {comparacion.placa.coincide ? (
                        <span className="indicador-ok"> ✓</span>
                      ) : (
                        <span className="indicador-error"> ✗</span>
                      )}
                    </div>
                    <div className="valores">
                      <div className="valor-extraido">
                        Guía SADA: {comparacion.placa.valorExtraido || "(no encontrado)"}
                      </div>
                      <div className="valor-manual">
                        Manual: {comparacion.placa.valorManual || "(vacío)"}
                      </div>
                    </div>
                  </div>

                  {/* Empresa destino - Siempre mostrar */}
                  <div
                    className={`comparacion-item ${
                      comparacion.empresaDestino.coincide
                        ? "coincide"
                        : "difiere"
                    }`}
                  >
                    <div className="campo-label">
                      Empresa destino
                      {comparacion.empresaDestino.coincide ? (
                        <span className="indicador-ok"> ✓</span>
                      ) : (
                        <span className="indicador-error"> ✗</span>
                      )}
                    </div>
                    <div className="valores">
                      <div className="valor-extraido">
                        Guía SADA: {comparacion.empresaDestino.valorExtraido || "(no encontrado)"}
                      </div>
                      <div className="valor-manual">
                        Manual: {comparacion.empresaDestino.valorManual || "(vacío)"}
                      </div>
                    </div>
                  </div>

                  {/* Código Espejo - Siempre mostrar */}
                  <div
                    className={`comparacion-item ${
                      comparacion.codigo_espejo?.coincide ? "coincide" : "difiere"
                    }`}
                  >
                    <div className="campo-label">
                      Código espejo
                      {comparacion.codigo_espejo?.coincide ? (
                        <span className="indicador-ok"> ✓</span>
                      ) : (
                        <span className="indicador-error"> ✗</span>
                      )}
                    </div>
                    <div className="valores">
                      <div className="valor-extraido">
                        Guía SADA: {comparacion.codigo_espejo?.valorExtraido || "(no encontrado)"}
                      </div>
                      <div className="valor-manual">
                        Manual: {comparacion.codigo_espejo?.valorManual || "(vacío)"}
                      </div>
                    </div>
                  </div>

                  {/* Estado - Siempre mostrar */}
                  <div
                    className={`comparacion-item ${
                      comparacion.estado.coincide ? "coincide" : "difiere"
                    }`}
                  >
                    <div className="campo-label">
                      Estado destino
                      {comparacion.estado.coincide ? (
                        <span className="indicador-ok"> ✓</span>
                      ) : (
                        <span className="indicador-error"> ✗</span>
                      )}
                    </div>
                    <div className="valores">
                      <div className="valor-extraido">
                        Guía SADA: {comparacion.estado.valorExtraido || "(no encontrado)"}
                      </div>
                      <div className="valor-manual">
                        Manual: {comparacion.estado.valorManual || "(vacío)"}
                      </div>
                    </div>
                  </div>

                  {/* Cantidad de rubros - Siempre mostrar */}
                  <div
                    className={`comparacion-item ${
                      comparacion.cantidadRubros.coincide
                        ? "coincide"
                        : "difiere"
                    }`}
                  >
                    <div className="campo-label">
                      Cantidad de rubros
                      {comparacion.cantidadRubros.coincide ? (
                        <span className="indicador-ok"> ✓</span>
                      ) : (
                        <span className="indicador-error"> ✗</span>
                      )}
                    </div>
                    <div className="valores">
                      <div className="valor-extraido">
                        Guía SADA: {comparacion.cantidadRubros.valorExtraidoFormateado || "(no encontrado)"} Kg
                      </div>
                      <div className="valor-manual">
                        Manual:{" "}
                        {comparacion.cantidadRubros.valorManualFormateado 
                          ? `${comparacion.cantidadRubros.valorManualFormateado} Kg`
                          : "(vacío)"}
                      </div>
                    </div>
                  </div>

                  {/* Fecha - Siempre mostrar */}
                  <div
                    className={`comparacion-item ${
                      comparacion.fecha.coincide ? "coincide" : "difiere"
                    }`}
                  >
                    <div className="campo-label">
                      Fecha guía SADA
                      {comparacion.fecha.coincide ? (
                        <span className="indicador-ok"> ✓</span>
                      ) : (
                        <span className="indicador-error"> ✗</span>
                      )}
                    </div>
                    <div className="valores">
                      <div className="valor-extraido">
                        Guía SADA: {comparacion.fecha.valorExtraido 
                          ? formatFecha(comparacion.fecha.valorExtraido) 
                          : "(no encontrado)"}
                      </div>
                      <div className="valor-manual">
                        Manual: {comparacion.fecha.valorManual 
                          ? formatFecha(comparacion.fecha.valorManual) 
                          : "(vacío)"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="button-group">
                <button
                  onClick={() => {
                    const { valid, missingFields } = validarDatosParaAnclajes(currentCarga);
                    if (!valid) {
                      alert(
                        "Faltan los siguientes campos obligatorios para generar anclajes:\n\n" +
                          missingFields.join("\n")
                      );
                      return;
                    }
                    navigate("/formulariosguia");
                  }}
                  className="btn-primary"
                >
                  Ir a anclajes
                </button>
                <button
                  onClick={() => {
                    setMostrarComparacion(false);
                    setDatosExtraidos(null);
                    setComparacion(null);
                  }}
                  className="btn-secondary"
                >
                  Procesar otra guía
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerGuiaSADA;
