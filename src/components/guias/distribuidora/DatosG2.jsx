import { PROVIDER_MAP } from "../../../constants/constants";
import { useState, useEffect } from "react";
import "../../../styles/guias/DatosG2.css";
import { codigos_espejo as companyNames } from "../../../constants/CodigosEspejo";
import { sinCodigo } from "../../../constants/Sincodigo";
import EditableField from "../../EditableField";
import { useAuth } from "../../login/AuthContext";
import LoadingSpinner from "../../LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useEstados } from "../../../contexts/EstadosContext";
import { useGuiaTabs } from "../GuiaTabsLayout";

const DatosG2 = () => {
  const { cargaActual, proveedor, updateCargaField, currentCarga } =
    useEstados();
  const key_prov = PROVIDER_MAP[proveedor];
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(() => {
    if (currentCarga?.destino) {
      return (
        companyNames.find(
          (company) => company.nombre === currentCarga.destino
        ) || {
          nombre: currentCarga.destino,
          codigo: currentCarga.codigo_espejo,
        }
      );
    }
    return null;
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { currentUser, loading } = useAuth();
  const [onEdit, setOnEdit] = useState(null);
  const navigate = useNavigate();
  const { setIsEditing } = useGuiaTabs() || {};

  useEffect(() => {
    if (currentCarga) {
      if (currentCarga.destino) {
        const matchingCompanyMain = companyNames.find(
          (company) => company.nombre === currentCarga.destino
        );

        // Then check in SinCodigo list
        const matchingCompanySinCodigo = sinCodigo.find(
          (company) => company.nombre === currentCarga.destino
        );

        let matchingCompany;
        if (matchingCompanySinCodigo) {
          // If found in sinCodigo, set codigo to "N/A"
          matchingCompany = {
            nombre: matchingCompanySinCodigo.nombre,
            codigo: "N/A",
          };
        } else if (matchingCompanyMain) {
          // If found in companyNames, use that company
          matchingCompany = matchingCompanyMain;
        } else {
          // Default fallback
          matchingCompany = {
            nombre: currentCarga.destino,
            codigo: currentCarga.codigo_espejo,
          };
        }

        setSelectedCompany(matchingCompany);
      } else {
        setSelectedCompany(null);
      }
    } else {
      setSelectedCompany(null);
    }
  }, [currentCarga]);

  // Reportar al layout si hay una edición en curso para bloquear el cambio de pestaña
  useEffect(() => {
    setIsEditing?.(onEdit !== null);
    return () => setIsEditing?.(false);
  }, [onEdit, setIsEditing]);

  // Guard: show loading spinner if cargas is not loaded yet
  if (!currentCarga || loading || !currentCarga.id) {
    return <LoadingSpinner />;
  }

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  /**
   * Calcula puntuación y metadatos para ordenar sugerencias.
   * Retorna { score, phraseIndex } para ordenamiento estable.
   */
  const getRelevanceData = (companyName, searchValue, searchWords) => {
    const nameLower = companyName.toLowerCase().replace(/\s+/g, " ");
    const searchNorm = searchValue.replace(/\s+/g, " ");

    // 1. Coincidencia exacta (máxima prioridad)
    if (nameLower === searchNorm) return { score: 10000, phraseIndex: 0 };

    // 2. El nombre empieza con la búsqueda completa
    if (nameLower.startsWith(searchNorm)) return { score: 9000, phraseIndex: 0 };

    // 3. La frase de búsqueda aparece consecutiva en el nombre (prioridad alta)
    const phraseIdx = nameLower.indexOf(searchNorm);
    if (phraseIdx >= 0) return { score: 8000, phraseIndex: phraseIdx };

    // 4. Todas las palabras coinciden
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

  const handleEmpresaInput = (e) => {
    const rawValue = e.target.value;
    const value = rawValue.toLowerCase().trim().replace(/\s+/g, " ");
    const searchWords = value.split(/\s+/).filter(Boolean);

    if (searchWords.length === 0) {
      setSuggestions([]);
      return;
    }

    const allCompanies = [
      ...companyNames.map((c) => ({ ...c })),
      ...sinCodigo.map((c) => ({ ...c })),
    ];

    const filtered = allCompanies.filter((company) =>
      searchWords.every((word) => company.nombre.toLowerCase().includes(word))
    );

    const sorted = [...filtered].sort((a, b) => {
      const dataA = getRelevanceData(a.nombre, value, searchWords);
      const dataB = getRelevanceData(b.nombre, value, searchWords);
      if (dataB.score !== dataA.score) return dataB.score - dataA.score;
      // Desempate: frase más al inicio primero, luego nombre más corto
      if (dataA.phraseIndex !== dataB.phraseIndex) return dataA.phraseIndex - dataB.phraseIndex;
      return a.nombre.length - b.nombre.length;
    });

    setSuggestions(
      sorted.map(({ nombre, codigo }) => ({ nombre, codigo }))
    );

    // Solo deseleccionar si no hay coincidencia exacta en ninguna lista
    const hasExactMatch = sorted.some(
      (c) => c.nombre.toLowerCase().replace(/\s+/g, " ").trim() === value
    );
    if (!hasExactMatch) {
      setSelectedCompany(null);
    }
  };

  const handleFieldSave = (name, value) => {
    // When saving "destino", también guardar codigo_espejo, estadoDestino y transporte según corresponda
    let updatedData;
    if (name === "destino") {
      const companyEspejo = companyNames.find((c) => c.nombre === value);
      const companySinCodigo = sinCodigo.find((c) => c.nombre === value);
      const company = companyEspejo || companySinCodigo;

      // Solo asignar estadoDestino si hay un estado válido (no vacío, no "N/A")
      const estadoValido =
        company?.estado &&
        String(company.estado).trim() !== "" &&
        String(company.estado).toUpperCase() !== "N/A";

      updatedData = {
        ...currentCarga,
        destino: value.toUpperCase(),
        codigo_espejo: company ? String(company.codigo).toUpperCase() : "N/A",
        ...(estadoValido && { estadoDestino: String(company.estado).toUpperCase() }),
        ...(companyEspejo?.entidad != null && companyEspejo.entidad !== "" && {
          transporte: String(companyEspejo.entidad).toUpperCase(),
        }),
        editHistory: {
          ...currentCarga.editHistory,
          [name]: {
            value: value.toUpperCase(),
            editedBy: currentUser.name,
            editedAt: new Date().toISOString(),
          },
        },
      };
    } else {
      updatedData = {
        ...currentCarga,
        [name]: value.toUpperCase(),
        editHistory: {
          ...currentCarga.editHistory,
          [name]: {
            value: value.toUpperCase(),
            editedBy: currentUser.name,
            editedAt: new Date().toISOString(),
          },
        },
      };
    }
    updateCargaField(key_prov, currentCarga.id, updatedData);
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={(e) => e.preventDefault()}>
          <h2>Comercializadora: </h2>
          {/****** Entidad destino *****/}
          <div className="empresa-input-container">
            <div className="dropdown-container">
              <EditableField
                fieldName="destino"
                label="Entidad destino"
                value={currentCarga?.destino}
                onSave={handleFieldSave}
                editHistory={currentCarga?.editHistory}
                onChange={(e) => {
                  handleEmpresaInput(e);
                  setShowSuggestions(true);
                }}
                suggestions={suggestions} // Pass suggestions
                showSuggestions={showSuggestions} // Pass showSuggestions
                setShowSuggestions={setShowSuggestions} // Pass setShowSuggestions
                placeholder="Escribe el nombre de la empresa"
                autoComplete={"off"}
                setOnEdit={setOnEdit}
                onEdit={onEdit}
                currentUser={currentUser} // Pass currentUser
                formatValue={(val) => val.toUpperCase()}
              />
            </div>
          </div>

          {/****** Codigo espejo *****/}
          {selectedCompany && (
            <p className="selected-company-code">
              Código espejo:{" "}
              {Number(selectedCompany.codigo) < 100
                ? "N/A"
                : selectedCompany.codigo}
            </p>
          )}

          {/****** Nombre empresa transporte *****/}
          <EditableField
            fieldName="transporte"
            label="Nombre de empresa que transporta"
            value={currentCarga?.transporte}
            placeholder="Ej.: Mercal"
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={(val) => val.toUpperCase()}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
          />

          {/****** Estado destino *****/}
          <EditableField
            fieldName="estadoDestino"
            label="Estado destino"
            value={currentCarga?.estadoDestino}
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={(val) => val.toUpperCase()}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
          />
        </form>
      </div>
    </div>
  );
};

export default DatosG2;
